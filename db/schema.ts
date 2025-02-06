import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  json,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "@auth/core/adapters";

// First define all tables
export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(), // Maps to Auth.js user id
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastActive: timestamp("last_active").defaultNow().notNull(),
    isOnline: boolean("is_online").default(false),
    profilePhoto: text("profile_photo"),
    phoneNumber: text("phone_number").notNull(),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    createdAtIdx: index("user_created_at_idx").on(table.createdAt),
    lastActiveIdx: index("user_last_active_idx").on(table.lastActive),
  })
);

// Auth.js tables
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Extended user profiles
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    age: integer("age"),
    gender: text("gender"),
    role: text("role").$type<"user" | "admin">().default("user"),

    interests: json("interests").$type<string[]>(),
    photos: json("photos").$type<string[]>(), // Array of photo URLs
    isVisible: boolean("is_visible").default(true),
    lastActive: timestamp("last_active").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isComplete: boolean("is_complete").default(false),
    profileCompleted: boolean("profile_completed").default(false),
    lookingFor: text("looking_for"),
    course: text("course"),
    yearOfStudy: integer("year_of_study"),
    instagram: text("instagram"),
    spotify: text("spotify"),
    snapchat: text("snapchat"),
    profilePhoto: text("profile_photo"),
    phoneNumber: text("phone_number"),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    isMatch: boolean("is_match").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("profile_user_id_idx").on(table.userId),
    isVisibleIdx: index("profile_is_visible_idx").on(table.isVisible),
    genderIdx: index("profile_gender_idx").on(table.gender),
    lastActiveIdx: index("profile_last_active_idx").on(table.lastActive),
    completedIdx: index("profile_completed_idx").on(table.profileCompleted),
  })
);

// Swipes/Likes
export const swipes = pgTable(
  "swipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    swiperId: text("swiper_id")
      .notNull()
      .references(() => users.id),
    swipedId: text("swiped_id")
      .notNull()
      .references(() => users.id),
    isLike: boolean("is_like").notNull(),
    type: text("type").notNull().default("regular"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    swiperIdx: index("swipe_swiper_idx").on(table.swiperId),
    swipedIdx: index("swipe_swiped_idx").on(table.swipedId),
    createdAtIdx: index("swipe_created_at_idx").on(table.createdAt),
    typeIdx: index("swipe_type_idx").on(table.type),
    swipeComboIdx: index("swipe_combo_idx").on(table.swiperId, table.swipedId),
  })
);

// Matches
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user1Id: text("user1_id")
      .notNull()
      .references(() => users.id),
    user2Id: text("user2_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at"),
    user1Typing: boolean("user1_typing").default(false),
    user2Typing: boolean("user2_typing").default(false),
  },
  (table) => ({
    user1Idx: index("match_user1_idx").on(table.user1Id),
    user2Idx: index("match_user2_idx").on(table.user2Id),
    createdAtIdx: index("match_created_at_idx").on(table.createdAt),
    lastMessageIdx: index("match_last_message_idx").on(table.lastMessageAt),
    // Compound index for faster match lookups
    matchComboIdx: index("match_combo_idx").on(table.user1Id, table.user2Id),
  })
);

export const feedbacks = pgTable("feedbacks", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  phoneNumber: text("phone_number"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages
export const messages = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Blocks
export const blocks = pgTable("blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockerId: text("blocker_id")
    .notNull()
    .references(() => users.id),
  blockedId: text("blocked_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Starred Profiles
export const starredProfiles = pgTable("starred_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  starredId: text("starred_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add this new table definition after the existing tables
export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // e.g., 'first_match', 'streak_7', 'likes_100'
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    title: text("title").notNull(), // e.g., "Match Maker", "Hot Streak"
    description: text("description").notNull(),
    icon: text("icon").notNull(), // emoji or icon identifier
    level: integer("level").default(1), // for tiered achievements
    progress: integer("progress").default(0), // for tracking progress
    maxProgress: integer("max_progress"), // for progress-based achievements
    isSecret: boolean("is_secret").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("achievement_user_id_idx").on(table.userId),
    typeIdx: index("achievement_type_idx").on(table.type),
    unlockedAtIdx: index("achievement_unlocked_at_idx").on(table.unlockedAt),
    // Compound index for faster user achievement lookups
    userTypeIdx: index("achievement_user_type_idx").on(
      table.userId,
      table.type
    ),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sentSwipes: many(swipes, { relationName: "swiperRelation" }),
  receivedSwipes: many(swipes, { relationName: "swipedRelation" }),
  matches1: many(matches, { relationName: "user1Relation" }),
  matches2: many(matches, { relationName: "user2Relation" }),
  starredProfiles: many(starredProfiles, {
    relationName: "userStarredProfiles",
  }),
  achievements: many(achievements),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  messages: many(messages, { relationName: "matchMessages" }),
}));

// Add the achievements relations
export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Then create type references at the end
export type Profile = typeof profiles.$inferSelect & {
  isMatch: boolean | null;
  userId: string;
  unreadMessages?: number;
  matchId?: string;
};

// Export the Message type if needed
export type Message = typeof messages.$inferSelect;
