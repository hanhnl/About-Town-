import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jurisdictions = pgTable("jurisdictions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  state: text("state").notNull(),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  dataSourceUrl: text("data_source_url"),
  logoUrl: text("logo_url"),
});

export const jurisdictionsRelations = relations(jurisdictions, ({ many }) => ({
  zipcodes: many(zipcodes),
  bills: many(bills),
  councilMembers: many(councilMembers),
}));

export const zipcodes = pgTable("zipcodes", {
  id: serial("id").primaryKey(),
  zipcode: text("zipcode").notNull().unique(),
  city: text("city"),
  state: text("state"),
  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),
  neighborhoods: text("neighborhoods").array(),
});

export const zipcodesRelations = relations(zipcodes, ({ one }) => ({
  jurisdiction: one(jurisdictions, {
    fields: [zipcodes.jurisdictionId],
    references: [jurisdictions.id],
  }),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  neighborhood: text("neighborhood"),
  zipcode: text("zipcode"),
  isModerator: boolean("is_moderator").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  votes: many(userVotes),
}));

export const councilMembers = pgTable("council_members", {
  id: serial("id").primaryKey(),
  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  district: text("district").notNull(),
  email: text("email"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  party: text("party"),
  termStart: text("term_start"),
  termEnd: text("term_end"),
  bio: text("bio"),
});

export const councilMembersRelations = relations(councilMembers, ({ one, many }) => ({
  jurisdiction: one(jurisdictions, {
    fields: [councilMembers.jurisdictionId],
    references: [jurisdictions.id],
  }),
  billVotes: many(councilVotes),
  contributions: many(campaignContributions),
}));

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  jurisdictionId: integer("jurisdiction_id").references(() => jurisdictions.id),
  billNumber: text("bill_number").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  fullText: text("full_text"),
  status: text("status").notNull().default("introduced"),
  topic: text("topic").notNull(),
  voteDate: text("vote_date"),
  introductionDate: text("introduction_date"),
  effectiveDate: text("effective_date"),
  sponsorId: integer("sponsor_id").references(() => councilMembers.id),
  sponsorName: text("sponsor_name"),
  cosponsors: text("cosponsors").array(),
  supportVotes: integer("support_votes").default(0),
  opposeVotes: integer("oppose_votes").default(0),
  sourceUrl: text("source_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  zipcodes: text("zipcodes").array(),
});

export const billsRelations = relations(bills, ({ one, many }) => ({
  jurisdiction: one(jurisdictions, {
    fields: [bills.jurisdictionId],
    references: [jurisdictions.id],
  }),
  sponsor: one(councilMembers, {
    fields: [bills.sponsorId],
    references: [councilMembers.id],
  }),
  comments: many(comments),
  councilVotes: many(councilVotes),
  userVotes: many(userVotes),
  timeline: many(billTimeline),
  amendments: many(amendments),
}));

export const billTimeline = pgTable("bill_timeline", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status"),
  type: text("type"),
});

export const billTimelineRelations = relations(billTimeline, ({ one }) => ({
  bill: one(bills, {
    fields: [billTimeline.billId],
    references: [bills.id],
  }),
}));

export const councilVotes = pgTable("council_votes", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  councilMemberId: integer("council_member_id").references(() => councilMembers.id).notNull(),
  vote: text("vote").notNull(),
});

export const councilVotesRelations = relations(councilVotes, ({ one }) => ({
  bill: one(bills, {
    fields: [councilVotes.billId],
    references: [bills.id],
  }),
  councilMember: one(councilMembers, {
    fields: [councilVotes.councilMemberId],
    references: [councilMembers.id],
  }),
}));

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  author: text("author").notNull(),
  authorInitials: text("author_initials").notNull(),
  neighborhood: text("neighborhood"),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  upvotes: integer("upvotes").default(0),
  parentId: integer("parent_id"),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  bill: one(bills, {
    fields: [comments.billId],
    references: [bills.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  replies: many(comments),
}));

export const userVotes = pgTable("user_votes", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  vote: text("vote").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userVotesRelations = relations(userVotes, ({ one }) => ({
  bill: one(bills, {
    fields: [userVotes.billId],
    references: [bills.id],
  }),
  user: one(users, {
    fields: [userVotes.userId],
    references: [users.id],
  }),
}));

export const campaignContributions = pgTable("campaign_contributions", {
  id: serial("id").primaryKey(),
  councilMemberId: integer("council_member_id").references(() => councilMembers.id).notNull(),
  donorCategory: text("donor_category").notNull(),
  amount: integer("amount").notNull(),
  percentage: integer("percentage"),
  cycle: text("cycle"),
});

export const campaignContributionsRelations = relations(campaignContributions, ({ one }) => ({
  councilMember: one(councilMembers, {
    fields: [campaignContributions.councilMemberId],
    references: [councilMembers.id],
  }),
}));

export const relatedBills = pgTable("related_bills", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  relatedBillId: integer("related_bill_id").references(() => bills.id).notNull(),
  relationship: text("relationship").notNull(),
});

export const amendments = pgTable("amendments", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  amendmentNumber: text("amendment_number").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  sponsorName: text("sponsor_name"),
  status: text("status").notNull(),
  voteDate: text("vote_date"),
  yesVotes: integer("yes_votes"),
  noVotes: integer("no_votes"),
  sourceUrl: text("source_url"),
});

export const amendmentsRelations = relations(amendments, ({ one }) => ({
  bill: one(bills, {
    fields: [amendments.billId],
    references: [bills.id],
  }),
}));

export const billStars = pgTable("bill_stars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billStarsRelations = relations(billStars, ({ one }) => ({
  user: one(users, {
    fields: [billStars.userId],
    references: [users.id],
  }),
  bill: one(bills, {
    fields: [billStars.billId],
    references: [bills.id],
  }),
}));

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertJurisdictionSchema = createInsertSchema(jurisdictions).omit({ id: true });
export const insertZipcodeSchema = createInsertSchema(zipcodes).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, lastUpdated: true });
export const insertCouncilMemberSchema = createInsertSchema(councilMembers).omit({ id: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, timestamp: true, upvotes: true });
export const insertUserVoteSchema = createInsertSchema(userVotes).omit({ id: true, createdAt: true });
export const insertCampaignContributionSchema = createInsertSchema(campaignContributions).omit({ id: true });
export const insertBillTimelineSchema = createInsertSchema(billTimeline).omit({ id: true });
export const insertCouncilVoteSchema = createInsertSchema(councilVotes).omit({ id: true });
export const insertAmendmentSchema = createInsertSchema(amendments).omit({ id: true });
export const insertBillStarSchema = createInsertSchema(billStars).omit({ id: true, createdAt: true });
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ id: true, subscribedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertCouncilMember = z.infer<typeof insertCouncilMemberSchema>;
export type CouncilMember = typeof councilMembers.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertUserVote = z.infer<typeof insertUserVoteSchema>;
export type UserVote = typeof userVotes.$inferSelect;
export type InsertCampaignContribution = z.infer<typeof insertCampaignContributionSchema>;
export type CampaignContribution = typeof campaignContributions.$inferSelect;
export type InsertBillTimeline = z.infer<typeof insertBillTimelineSchema>;
export type BillTimeline = typeof billTimeline.$inferSelect;
export type InsertCouncilVote = z.infer<typeof insertCouncilVoteSchema>;
export type CouncilVote = typeof councilVotes.$inferSelect;
export type InsertJurisdiction = z.infer<typeof insertJurisdictionSchema>;
export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type InsertZipcode = z.infer<typeof insertZipcodeSchema>;
export type Zipcode = typeof zipcodes.$inferSelect;
export type InsertAmendment = z.infer<typeof insertAmendmentSchema>;
export type Amendment = typeof amendments.$inferSelect;
export type InsertBillStar = z.infer<typeof insertBillStarSchema>;
export type BillStar = typeof billStars.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
