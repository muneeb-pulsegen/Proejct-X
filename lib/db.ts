import { randomUUID } from "crypto";

import { Db, MongoClient, ObjectId, OptionalId } from "mongodb";

export type UserRole = "player" | "coach";
export type InviteStatus = "pending" | "accepted" | "declined";
export type Severity = "Mild" | "Moderate" | "Severe";

export type AnalysisResult = {
  injury_type: string;
  severity: Severity;
  healing_time: string;
  confidence: number;
  suggestions: string[];
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  profileImageData: string | null;
  teamId: string | null;
  createdAt: string;
};

export type TeamRecord = {
  id: string;
  coachUserId: string;
  name: string;
  createdAt: string;
};

export type TeamInviteRecord = {
  id: string;
  teamId: string;
  coachUserId: string;
  playerUserId: string;
  status: InviteStatus;
  createdAt: string;
  respondedAt: string | null;
};

export type InjuryReportRecord = {
  id: string;
  playerUserId: string;
  teamId: string | null;
  injuryImageData: string;
  extraImages: string[];
  injuryTitle: string;
  bodyArea: string;
  painLevel: number;
  notes: string;
  analysis: AnalysisResult;
  createdAt: string;
};

type UserMongoDocument = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  profileImageData: string | null;
  teamId: string | null;
  createdAt: Date;
};

type TeamMongoDocument = {
  _id: ObjectId;
  coachUserId: string;
  name: string;
  createdAt: Date;
};

type TeamInviteMongoDocument = {
  _id: ObjectId;
  teamId: string;
  coachUserId: string;
  playerUserId: string;
  status: InviteStatus;
  createdAt: Date;
  respondedAt: Date | null;
};

type InjuryReportMongoDocument = {
  _id: ObjectId;
  playerUserId: string;
  teamId: string | null;
  injuryImageData: string;
  extraImages: string[];
  injuryTitle: string;
  bodyArea: string;
  painLevel: number;
  notes: string;
  analysis: AnalysisResult;
  createdAt: Date;
};

type MemoryStore = {
  users: UserRecord[];
  teams: TeamRecord[];
  invites: TeamInviteRecord[];
  reports: InjuryReportRecord[];
};

declare global {
  var __injuryxMongoClientPromise: Promise<MongoClient> | undefined;
  var __injuryxMongoIndexesReady: Promise<void> | undefined;
  var __injuryxMemoryStore: MemoryStore | undefined;
  var __injuryxDemoSeeded: boolean | undefined;
}

const memoryStore =
  global.__injuryxMemoryStore ||
  (global.__injuryxMemoryStore = {
    users: [],
    teams: [],
    invites: [],
    reports: []
  });

let mongoUnavailable = false;

function shouldUseMemoryOnly() {
  return process.env.USE_IN_MEMORY_ONLY === "true";
}

const DEMO_PASSWORD_HASH =
  "$2b$12$LJnXju0oN/X75tFyQA4jcuJH3huXq26507dz28nMJYCZjXOmOECmG";
const DEMO_CREATED_AT = new Date("2026-04-20T08:00:00.000Z").getTime();
const BODY_AREAS = [
  "Right ankle",
  "Left knee",
  "Lower back",
  "Right shoulder",
  "Left hamstring",
  "Right wrist",
  "Left foot",
  "Neck"
] as const;
const INJURY_TITLES = [
  "Training abrasion",
  "Match-day laceration",
  "Turf blister",
  "Impact bruise",
  "Surface tear",
  "Pressure irritation"
] as const;
const INJURY_TYPES = [
  {
    injury_type: "Ankle Sprain",
    severity: "Moderate",
    healing_time: "2-4 weeks",
    confidence: 0.87,
    suggestions: ["Limit load for 48 hours", "Use compression support", "Monitor swelling and mobility"]
  },
  {
    injury_type: "Muscle Strain",
    severity: "Mild",
    healing_time: "1-2 weeks",
    confidence: 0.81,
    suggestions: ["Reduce training intensity", "Begin light mobility work", "Track discomfort after sessions"]
  },
  {
    injury_type: "Impact Contusion",
    severity: "Moderate",
    healing_time: "3-6 weeks",
    confidence: 0.84,
    suggestions: ["Ice after activity", "Monitor tenderness", "Adjust load until symptoms settle"]
  },
  {
    injury_type: "Joint Instability",
    severity: "Severe",
    healing_time: "4-8 weeks",
    confidence: 0.79,
    suggestions: ["Escalate for medical review", "Restrict return to play", "Track pain, swelling, and stability"]
  }
] satisfies AnalysisResult[];

function createAvatarDataUri(seed: string, label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 82% 72%)" />
      <stop offset="100%" stop-color="hsl(${(hue + 45) % 360} 78% 58%)" />
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="34" fill="url(#g)" />
  <circle cx="80" cy="62" r="28" fill="rgba(255,255,255,0.72)" />
  <path d="M40 132c10-24 28-36 40-36s30 12 40 36" fill="rgba(255,255,255,0.72)" />
  <text x="80" y="150" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="rgba(15,23,42,0.72)">${label}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg + seed)}`;
}

function createInjuryImageDataUri(index: number, bodyArea: string, severity: Severity) {
  const palette =
    severity === "Severe"
      ? ["#7f1d1d", "#dc2626", "#fecaca"]
      : severity === "Moderate"
        ? ["#9a3412", "#f97316", "#fed7aa"]
        : ["#0f766e", "#14b8a6", "#99f6e4"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="540" viewBox="0 0 720 540">
  <rect width="720" height="540" fill="${palette[2]}" />
  <circle cx="360" cy="270" r="170" fill="${palette[1]}" opacity="0.18" />
  <ellipse cx="380" cy="255" rx="130" ry="110" fill="${palette[0]}" opacity="0.3" />
  <ellipse cx="380" cy="255" rx="84" ry="62" fill="${palette[1]}" opacity="0.52" />
  <path d="M300 320c30-35 68-52 120-50" stroke="${palette[0]}" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.34" />
  <text x="40" y="64" font-family="Arial, sans-serif" font-size="32" fill="#0f172a">InjuryX Demo Report ${index + 1}</text>
  <text x="40" y="108" font-family="Arial, sans-serif" font-size="24" fill="#334155">${bodyArea}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function initializeDemoData() {
  if (global.__injuryxDemoSeeded) {
    return;
  }

  if (
    memoryStore.users.length > 0 ||
    memoryStore.teams.length > 0 ||
    memoryStore.invites.length > 0 ||
    memoryStore.reports.length > 0
  ) {
    global.__injuryxDemoSeeded = true;
    return;
  }

  const coaches: UserRecord[] = Array.from({ length: 4 }, (_, index) => {
    const coachId = randomUUID();
    const name = ["Ava Reyes", "Marcus Cole", "Nina Patel", "Jordan Hale"][index];
    const teamId = randomUUID();

    memoryStore.teams.push({
      id: teamId,
      coachUserId: coachId,
      name: `${name.split(" ")[0]}'s Team`,
      createdAt: new Date(DEMO_CREATED_AT + index * 60_000).toISOString()
    });

    return {
      id: coachId,
      email: `coach${index + 1}@injuryx.demo`,
      passwordHash: DEMO_PASSWORD_HASH,
      role: "coach",
      name,
      profileImageData: createAvatarDataUri(`coach-${index}`, name.split(" ").map((part) => part[0]).join(""), 208 + index * 22),
      teamId,
      createdAt: new Date(DEMO_CREATED_AT + index * 60_000).toISOString()
    };
  });

  memoryStore.users.push(...coaches);

  const acceptedPlayersByCoach = 8;
  const pendingPlayersByCoach = 2;

  Array.from({ length: 40 }, (_, index) => {
    const coachIndex = Math.floor(index / 10);
    const coach = coaches[coachIndex];
    const teamId = coach.teamId || memoryStore.teams.find((team) => team.coachUserId === coach.id)?.id;

    if (!teamId) {
      throw new Error(`Demo seed failed: missing team for coach ${coach.id}`);
    }
    const playerId = randomUUID();
    const createdAt = new Date(DEMO_CREATED_AT + (index + 10) * 60_000).toISOString();
    const name = [
      "Liam Carter",
      "Noah Bennett",
      "Emma Brooks",
      "Olivia Stone",
      "Ethan Reed",
      "Sophia Grant",
      "Mason Lee",
      "Isla Turner",
      "Lucas Ward",
      "Mia Foster"
    ][index % 10];
    const playerName = `${name.split(" ")[0]} ${String.fromCharCode(65 + coachIndex)}${index + 1}`;
    const isAccepted = index % 10 < acceptedPlayersByCoach;
    const profileHue = 150 + (index % 8) * 14;
    const player: UserRecord = {
      id: playerId,
      email: `player${index + 1}@injuryx.demo`,
      passwordHash: DEMO_PASSWORD_HASH,
      role: "player",
      name: playerName,
      profileImageData: createAvatarDataUri(`player-${index}`, playerName.split(" ").map((part) => part[0]).join("").slice(0, 2), profileHue),
      teamId: isAccepted ? teamId : null,
      createdAt
    };

    memoryStore.users.push(player);

    const inviteCreatedAt = new Date(DEMO_CREATED_AT + (index + 80) * 60_000);
    memoryStore.invites.push({
      id: randomUUID(),
      teamId,
      coachUserId: coach.id,
      playerUserId: playerId,
      status: isAccepted ? "accepted" : index % 2 === 0 ? "pending" : "declined",
      createdAt: inviteCreatedAt.toISOString(),
      respondedAt: isAccepted || index % 2 !== 0 ? new Date(inviteCreatedAt.getTime() + 3_600_000).toISOString() : null
    });

    if (!isAccepted) {
      return;
    }

    const reportCount = index % 3 === 0 ? 2 : 1;

    Array.from({ length: reportCount }, (_, reportOffset) => {
      const analysis = INJURY_TYPES[(index + reportOffset) % INJURY_TYPES.length];
      const bodyArea = BODY_AREAS[(index + reportOffset) % BODY_AREAS.length];
      const createdDate = new Date(DEMO_CREATED_AT + (index * 6 + reportOffset) * 3_600_000);
      const injuryImageData = createInjuryImageDataUri(index + reportOffset, bodyArea, analysis.severity);

      memoryStore.reports.push({
        id: randomUUID(),
        playerUserId: playerId,
        teamId,
        injuryImageData,
        extraImages: reportOffset === 0 ? [createInjuryImageDataUri(index + reportOffset + 100, bodyArea, analysis.severity)] : [],
        injuryTitle: INJURY_TITLES[(index + reportOffset) % INJURY_TITLES.length],
        bodyArea,
        painLevel: Math.min(10, 3 + ((index + reportOffset) % 7)),
        notes:
          reportOffset === 0
            ? "Player reported discomfort during training and reduced range of motion after the session."
            : "Follow-up image after treatment cycle. Pain and swelling remain under review.",
        analysis,
        createdAt: createdDate.toISOString()
      });
    });
  });

  memoryStore.invites.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  memoryStore.reports.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  global.__injuryxDemoSeeded = true;
}

async function getDatabase(): Promise<Db | null> {
  if (shouldUseMemoryOnly() || mongoUnavailable || !process.env.MONGODB_URI) {
    initializeDemoData();
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
        database.collection<UserMongoDocument>("users").createIndex({ role: 1, teamId: 1 }),
        database.collection<TeamMongoDocument>("teams").createIndex({ coachUserId: 1 }, { unique: true }),
        database
          .collection<TeamInviteMongoDocument>("teamInvites")
          .createIndex({ playerUserId: 1, status: 1, createdAt: -1 }),
        database
          .collection<TeamInviteMongoDocument>("teamInvites")
          .createIndex(
            { teamId: 1, playerUserId: 1, status: 1 },
            { unique: true, partialFilterExpression: { status: "pending" } }
          ),
        database
          .collection<InjuryReportMongoDocument>("injuryReports")
          .createIndex({ playerUserId: 1, createdAt: -1 }),
        database
          .collection<InjuryReportMongoDocument>("injuryReports")
          .createIndex({ teamId: 1, createdAt: -1 })
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
    role: document.role,
    name: document.name,
    profileImageData: document.profileImageData,
    teamId: document.teamId,
    createdAt: document.createdAt.toISOString()
  };
}

function toTeamRecord(document: TeamMongoDocument): TeamRecord {
  return {
    id: document._id.toString(),
    coachUserId: document.coachUserId,
    name: document.name,
    createdAt: document.createdAt.toISOString()
  };
}

function toInviteRecord(document: TeamInviteMongoDocument): TeamInviteRecord {
  return {
    id: document._id.toString(),
    teamId: document.teamId,
    coachUserId: document.coachUserId,
    playerUserId: document.playerUserId,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    respondedAt: document.respondedAt ? document.respondedAt.toISOString() : null
  };
}

function toReportRecord(document: InjuryReportMongoDocument): InjuryReportRecord {
  return {
    id: document._id.toString(),
    playerUserId: document.playerUserId,
    teamId: document.teamId,
    injuryImageData: document.injuryImageData,
    extraImages: document.extraImages,
    injuryTitle: document.injuryTitle,
    bodyArea: document.bodyArea,
    painLevel: document.painLevel,
    notes: document.notes,
    analysis: document.analysis,
    createdAt: document.createdAt.toISOString()
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

export async function findUserById(id: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.users.find((user) => user.id === id) || null;
  }

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const user = await database
    .collection<UserMongoDocument>("users")
    .findOne({ _id: new ObjectId(id) });

  return user ? toUserRecord(user) : null;
}

export async function createUser({
  email,
  passwordHash,
  role,
  name
}: {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
}) {
  const database = await getDatabase();

  if (!database) {
    const user: UserRecord = {
      id: randomUUID(),
      email,
      passwordHash,
      role,
      name,
      profileImageData: null,
      teamId: null,
      createdAt: new Date().toISOString()
    };

    memoryStore.users.push(user);
    return user;
  }

  const payload = {
    email,
    passwordHash,
    role,
    name,
    profileImageData: null,
    teamId: null,
    createdAt: new Date()
  };

  const result = await database.collection<OptionalId<UserMongoDocument>>("users").insertOne(payload);

  return toUserRecord({
    _id: result.insertedId,
    ...payload
  });
}

export async function updateUserProfile({
  userId,
  name,
  profileImageData
}: {
  userId: string;
  name: string;
  profileImageData: string | null;
}) {
  const database = await getDatabase();

  if (!database) {
    const user = memoryStore.users.find((entry) => entry.id === userId);

    if (!user) {
      return null;
    }

    user.name = name;
    user.profileImageData = profileImageData;
    return user;
  }

  if (!ObjectId.isValid(userId)) {
    return null;
  }

  await database.collection<UserMongoDocument>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        name,
        profileImageData
      }
    }
  );

  return findUserById(userId);
}

export async function assignUserToTeam(userId: string, teamId: string | null) {
  const database = await getDatabase();

  if (!database) {
    const user = memoryStore.users.find((entry) => entry.id === userId);

    if (!user) {
      return null;
    }

    user.teamId = teamId;
    return user;
  }

  if (!ObjectId.isValid(userId)) {
    return null;
  }

  await database.collection<UserMongoDocument>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        teamId
      }
    }
  );

  return findUserById(userId);
}

export async function createTeam({
  coachUserId,
  name
}: {
  coachUserId: string;
  name: string;
}) {
  const database = await getDatabase();

  if (!database) {
    const team: TeamRecord = {
      id: randomUUID(),
      coachUserId,
      name,
      createdAt: new Date().toISOString()
    };

    memoryStore.teams.push(team);
    return team;
  }

  const payload = {
    coachUserId,
    name,
    createdAt: new Date()
  };

  const result = await database.collection<OptionalId<TeamMongoDocument>>("teams").insertOne(payload);

  return toTeamRecord({
    _id: result.insertedId,
    ...payload
  });
}

export async function findTeamByCoachUserId(coachUserId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.teams.find((team) => team.coachUserId === coachUserId) || null;
  }

  const team = await database.collection<TeamMongoDocument>("teams").findOne({ coachUserId });
  return team ? toTeamRecord(team) : null;
}

export async function findTeamById(teamId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.teams.find((team) => team.id === teamId) || null;
  }

  if (!ObjectId.isValid(teamId)) {
    return null;
  }

  const team = await database
    .collection<TeamMongoDocument>("teams")
    .findOne({ _id: new ObjectId(teamId) });

  return team ? toTeamRecord(team) : null;
}

export async function createInvite({
  teamId,
  coachUserId,
  playerUserId
}: {
  teamId: string;
  coachUserId: string;
  playerUserId: string;
}) {
  const database = await getDatabase();

  if (!database) {
    const invite: TeamInviteRecord = {
      id: randomUUID(),
      teamId,
      coachUserId,
      playerUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
      respondedAt: null
    };

    memoryStore.invites.unshift(invite);
    return invite;
  }

  const payload = {
    teamId,
    coachUserId,
    playerUserId,
    status: "pending" as InviteStatus,
    createdAt: new Date(),
    respondedAt: null
  };

  const result = await database
    .collection<OptionalId<TeamInviteMongoDocument>>("teamInvites")
    .insertOne(payload);

  return toInviteRecord({
    _id: result.insertedId,
    ...payload
  });
}

export async function findPendingInvite({
  teamId,
  playerUserId
}: {
  teamId: string;
  playerUserId: string;
}) {
  const database = await getDatabase();

  if (!database) {
    return (
      memoryStore.invites.find(
        (invite) =>
          invite.teamId === teamId &&
          invite.playerUserId === playerUserId &&
          invite.status === "pending"
      ) || null
    );
  }

  const invite = await database.collection<TeamInviteMongoDocument>("teamInvites").findOne({
    teamId,
    playerUserId,
    status: "pending"
  });

  return invite ? toInviteRecord(invite) : null;
}

export async function listInvitesForCoach(coachUserId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.invites
      .filter((invite) => invite.coachUserId === coachUserId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const invites = await database
    .collection<TeamInviteMongoDocument>("teamInvites")
    .find({ coachUserId })
    .sort({ createdAt: -1 })
    .toArray();

  return invites.map(toInviteRecord);
}

export async function listInvitesForPlayer(playerUserId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.invites
      .filter((invite) => invite.playerUserId === playerUserId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const invites = await database
    .collection<TeamInviteMongoDocument>("teamInvites")
    .find({ playerUserId })
    .sort({ createdAt: -1 })
    .toArray();

  return invites.map(toInviteRecord);
}

export async function findInviteById(inviteId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.invites.find((invite) => invite.id === inviteId) || null;
  }

  if (!ObjectId.isValid(inviteId)) {
    return null;
  }

  const invite = await database
    .collection<TeamInviteMongoDocument>("teamInvites")
    .findOne({ _id: new ObjectId(inviteId) });

  return invite ? toInviteRecord(invite) : null;
}

export async function respondToInvite({
  inviteId,
  status
}: {
  inviteId: string;
  status: Extract<InviteStatus, "accepted" | "declined">;
}) {
  const database = await getDatabase();

  if (!database) {
    const invite = memoryStore.invites.find((entry) => entry.id === inviteId);

    if (!invite) {
      return null;
    }

    invite.status = status;
    invite.respondedAt = new Date().toISOString();
    return invite;
  }

  if (!ObjectId.isValid(inviteId)) {
    return null;
  }

  await database.collection<TeamInviteMongoDocument>("teamInvites").updateOne(
    { _id: new ObjectId(inviteId) },
    {
      $set: {
        status,
        respondedAt: new Date()
      }
    }
  );

  return findInviteById(inviteId);
}

export async function markOtherPendingInvitesDeclined(playerUserId: string, acceptedInviteId: string) {
  const database = await getDatabase();

  if (!database) {
    const timestamp = new Date().toISOString();
    memoryStore.invites.forEach((invite) => {
      if (
        invite.playerUserId === playerUserId &&
        invite.status === "pending" &&
        invite.id !== acceptedInviteId
      ) {
        invite.status = "declined";
        invite.respondedAt = timestamp;
      }
    });
    return;
  }

  await database.collection<TeamInviteMongoDocument>("teamInvites").updateMany(
    { playerUserId, status: "pending", _id: { $ne: new ObjectId(acceptedInviteId) } },
    {
      $set: {
        status: "declined",
        respondedAt: new Date()
      }
    }
  );
}

export async function listTeamMembers(teamId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.users
      .filter((user) => user.role === "player" && user.teamId === teamId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  const users = await database
    .collection<UserMongoDocument>("users")
    .find({ role: "player", teamId })
    .sort({ name: 1 })
    .toArray();

  return users.map(toUserRecord);
}

export async function searchEligiblePlayers(query: string) {
  const trimmedQuery = query.trim().toLowerCase();
  const database = await getDatabase();

  if (!database) {
    return memoryStore.users
      .filter((user) => {
        if (user.role !== "player") {
          return false;
        }

        if (user.teamId) {
          return false;
        }

        return (
          user.email.toLowerCase().includes(trimmedQuery) ||
          user.name.toLowerCase().includes(trimmedQuery)
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  const conditions = trimmedQuery
    ? {
        $or: [
          { email: { $regex: trimmedQuery, $options: "i" } },
          { name: { $regex: trimmedQuery, $options: "i" } }
        ]
      }
    : {};

  const users = await database
    .collection<UserMongoDocument>("users")
    .find({
      role: "player",
      teamId: null,
      ...conditions
    })
    .sort({ name: 1 })
    .limit(12)
    .toArray();

  return users.map(toUserRecord);
}

export async function createInjuryReport({
  playerUserId,
  teamId,
  injuryImageData,
  extraImages,
  injuryTitle,
  bodyArea,
  painLevel,
  notes,
  analysis
}: {
  playerUserId: string;
  teamId: string | null;
  injuryImageData: string;
  extraImages: string[];
  injuryTitle: string;
  bodyArea: string;
  painLevel: number;
  notes: string;
  analysis: AnalysisResult;
}) {
  const database = await getDatabase();

  if (!database) {
    const report: InjuryReportRecord = {
      id: randomUUID(),
      playerUserId,
      teamId,
      injuryImageData,
      extraImages,
      injuryTitle,
      bodyArea,
      painLevel,
      notes,
      analysis,
      createdAt: new Date().toISOString()
    };

    memoryStore.reports.unshift(report);
    return report;
  }

  const payload = {
    playerUserId,
    teamId,
    injuryImageData,
    extraImages,
    injuryTitle,
    bodyArea,
    painLevel,
    notes,
    analysis,
    createdAt: new Date()
  };

  const result = await database
    .collection<OptionalId<InjuryReportMongoDocument>>("injuryReports")
    .insertOne(payload);

  return toReportRecord({
    _id: result.insertedId,
    ...payload
  });
}

export async function listReportsForPlayer(playerUserId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.reports
      .filter((report) => report.playerUserId === playerUserId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const reports = await database
    .collection<InjuryReportMongoDocument>("injuryReports")
    .find({ playerUserId })
    .sort({ createdAt: -1 })
    .toArray();

  return reports.map(toReportRecord);
}

export async function listReportsForTeam(teamId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.reports
      .filter((report) => report.teamId === teamId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const reports = await database
    .collection<InjuryReportMongoDocument>("injuryReports")
    .find({ teamId })
    .sort({ createdAt: -1 })
    .toArray();

  return reports.map(toReportRecord);
}

export async function findReportById(reportId: string) {
  const database = await getDatabase();

  if (!database) {
    return memoryStore.reports.find((report) => report.id === reportId) || null;
  }

  if (!ObjectId.isValid(reportId)) {
    return null;
  }

  const report = await database
    .collection<InjuryReportMongoDocument>("injuryReports")
    .findOne({ _id: new ObjectId(reportId) });

  return report ? toReportRecord(report) : null;
}
