import { randomUUID } from "crypto";

import { Db, MongoClient, ObjectId, OptionalId } from "mongodb";

export type AnalysisResult = {
  wound_type: string;
  severity: string;
  healing_time: string;
  confidence: number;
  suggestions: string[];
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type AnalysisRecord = {
  id: string;
  userId: string;
  imageData: string;
  createdAt: string;
  result: AnalysisResult;
};

type UserMongoDocument = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type AnalysisMongoDocument = {
  _id: ObjectId;
  userId: string;
  imageData: string;
  createdAt: Date;
  result: AnalysisResult;
};

type MemoryStore = {
  users: UserRecord[];
  analyses: AnalysisRecord[];
};

declare global {
  var __injuryxMongoClientPromise: Promise<MongoClient> | undefined;
  var __injuryxMongoIndexesReady: Promise<void> | undefined;
  var __injuryxMemoryStore: MemoryStore | undefined;
}

const memoryStore =
  global.__injuryxMemoryStore ||
  (global.__injuryxMemoryStore = {
    users: [],
    analyses: []
  });

let mongoUnavailable = false;

async function getDatabase(): Promise<Db | null> {
  if (mongoUnavailable || !process.env.MONGODB_URI) {
    return null;
  }

  try {
    if (!global.__injuryxMongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI);
      global.__injuryxMongoClientPromise = client.connect();
    }

    const client = await global.__injuryxMongoClientPromise;
    const database = client.db(process.env.MONGODB_DB || "injuryx");

    if (!global.__injuryxMongoIndexesReady) {
      global.__injuryxMongoIndexesReady = Promise.all([
        database.collection<UserMongoDocument>("users").createIndex({ email: 1 }, { unique: true }),
        database
          .collection<AnalysisMongoDocument>("analyses")
          .createIndex({ userId: 1, createdAt: -1 })
      ]).then(() => undefined);
    }

    await global.__injuryxMongoIndexesReady;

    return database;
  } catch (error) {
    console.error("MongoDB unavailable, falling back to in-memory storage.", error);
    mongoUnavailable = true;
    return null;
  }
}

function toUserRecord(document: UserMongoDocument): UserRecord {
  return {
    id: document._id.toString(),
    email: document.email,
    passwordHash: document.passwordHash,
    createdAt: document.createdAt.toISOString()
  };
}

function toAnalysisRecord(document: AnalysisMongoDocument): AnalysisRecord {
  return {
    id: document._id.toString(),
    userId: document.userId,
    imageData: document.imageData,
    createdAt: document.createdAt.toISOString(),
    result: document.result
  };
}

export async function findUserByEmail(email: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.users.find((user) => user.email === email) || null;
  }

  const user = await database.collection<UserMongoDocument>("users").findOne({ email });
  return user ? toUserRecord(user) : null;
}

export async function createUser({
  email,
  passwordHash
}: {
  email: string;
  passwordHash: string;
}) {
  const database = await getDatabase();

  if (!database) {
    const user: UserRecord = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    memoryStore.users.push(user);
    return user;
  }

  const payload = {
    email,
    passwordHash,
    createdAt: new Date()
  };

  const result = await database
    .collection<OptionalId<UserMongoDocument>>("users")
    .insertOne(payload);

  return toUserRecord({
    _id: result.insertedId,
    ...payload
  });
}

export async function createAnalysis({
  userId,
  imageData,
  result
}: {
  userId: string;
  imageData: string;
  result: AnalysisResult;
}) {
  const database = await getDatabase();

  if (!database) {
    const analysis: AnalysisRecord = {
      id: randomUUID(),
      userId,
      imageData,
      createdAt: new Date().toISOString(),
      result
    };

    memoryStore.analyses.unshift(analysis);
    return analysis;
  }

  const payload = {
    userId,
    imageData,
    createdAt: new Date(),
    result
  };

  const insertResult = await database
    .collection<OptionalId<AnalysisMongoDocument>>("analyses")
    .insertOne(payload);

  return toAnalysisRecord({
    _id: insertResult.insertedId,
    ...payload
  });
}

export async function findAnalysisByIdForUser(id: string, userId: string) {
  const database = await getDatabase();

  if (!database) {
    return (
      memoryStore.analyses.find((analysis) => analysis.id === id && analysis.userId === userId) ||
      null
    );
  }

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const analysis = await database
    .collection<AnalysisMongoDocument>("analyses")
    .findOne({ _id: new ObjectId(id), userId });

  return analysis ? toAnalysisRecord(analysis) : null;
}
