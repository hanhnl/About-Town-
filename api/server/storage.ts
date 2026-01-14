import {
  users, bills, councilMembers, comments, userVotes, campaignContributions,
  councilVotes, billTimeline, relatedBills, jurisdictions, zipcodes, amendments, billStars,
  newsletterSubscriptions,
  type User, type InsertUser,
  type Bill, type InsertBill,
  type CouncilMember, type InsertCouncilMember,
  type Comment, type InsertComment,
  type UserVote, type InsertUserVote,
  type CampaignContribution, type InsertCampaignContribution,
  type BillTimeline, type InsertBillTimeline,
  type CouncilVote, type InsertCouncilVote,
  type Jurisdiction, type InsertJurisdiction,
  type Zipcode, type InsertZipcode,
  type Amendment, type InsertAmendment,
  type BillStar, type InsertBillStar,
  type NewsletterSubscription, type InsertNewsletterSubscription
} from "@shared/schema";
import { db, isDatabaseConfigured } from "./db";
import { eq, ilike, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getZipcodeByCode(zipcode: string): Promise<Zipcode | undefined>;

  getBills(filters?: { topic?: string; status?: string; zipcode?: string; search?: string }): Promise<Bill[]>;
  getBill(id: number): Promise<Bill | undefined>;
  getBillByNumber(billNumber: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, updates: Partial<InsertBill>): Promise<Bill | undefined>;

  getCouncilMembers(): Promise<CouncilMember[]>;
  getCouncilMember(id: number): Promise<CouncilMember | undefined>;
  getCouncilMembersByDistrict(district: string): Promise<CouncilMember[]>;
  createCouncilMember(member: InsertCouncilMember): Promise<CouncilMember>;

  getComments(billId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  upvoteComment(id: number): Promise<Comment | undefined>;

  getUserVote(billId: number, userId: number): Promise<UserVote | undefined>;
  createUserVote(vote: InsertUserVote): Promise<UserVote>;

  getCampaignContributions(councilMemberId?: number): Promise<CampaignContribution[]>;
  createCampaignContribution(contribution: InsertCampaignContribution): Promise<CampaignContribution>;

  getCouncilVotes(billId: number): Promise<(CouncilVote & { councilMember?: CouncilMember })[]>;
  createCouncilVote(vote: InsertCouncilVote): Promise<CouncilVote>;

  getBillTimeline(billId: number): Promise<BillTimeline[]>;
  createBillTimelineEvent(event: InsertBillTimeline): Promise<BillTimeline>;

  getJurisdictions(): Promise<Jurisdiction[]>;
  getJurisdiction(id: number): Promise<Jurisdiction | undefined>;
  getJurisdictionBySlug(slug: string): Promise<Jurisdiction | undefined>;
  
  getZipcodes(jurisdictionId?: number): Promise<Zipcode[]>;
  getZipcode(zipcode: string): Promise<(Zipcode & { jurisdiction?: Jurisdiction }) | undefined>;
  
  getAmendments(billId: number): Promise<Amendment[]>;
  createAmendment(amendment: InsertAmendment): Promise<Amendment>;
  
  starBill(userId: number, billId: number): Promise<BillStar>;
  unstarBill(userId: number, billId: number): Promise<void>;
  isStarred(userId: number, billId: number): Promise<boolean>;
  getStarredBills(userId: number): Promise<(BillStar & { bill: Bill })[]>;
  getUserComments(userId: number): Promise<(Comment & { bill?: Bill })[]>;

  subscribeToNewsletter(email: string): Promise<NewsletterSubscription>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getZipcodeByCode(zipcode: string): Promise<Zipcode | undefined> {
    const [result] = await db!.select().from(zipcodes).where(eq(zipcodes.zipcode, zipcode));
    return result || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(insertUser).returning();
    return user;
  }

  async getBills(filters?: { topic?: string; status?: string; zipcode?: string; search?: string }): Promise<Bill[]> {
    const conditions = [];
    
    if (filters?.topic) {
      conditions.push(eq(bills.topic, filters.topic));
    }
    if (filters?.status) {
      conditions.push(eq(bills.status, filters.status));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(bills.title, `%${filters.search}%`),
          ilike(bills.summary, `%${filters.search}%`)
        )
      );
    }
    if (filters?.zipcode) {
      // Filter bills that have this zipcode in their zipcodes array
      // Using SQL array contains operator
      conditions.push(sql`${bills.zipcodes} @> ARRAY[${filters.zipcode}]::text[]`);
    }
    
    if (conditions.length > 0) {
      return await db!.select().from(bills).where(and(...conditions)).orderBy(desc(bills.lastUpdated));
    }

    return await db!.select().from(bills).orderBy(desc(bills.lastUpdated));
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db!.select().from(bills).where(eq(bills.id, id));
    return bill || undefined;
  }

  async getBillByNumber(billNumber: string): Promise<Bill | undefined> {
    const [bill] = await db!.select().from(bills).where(eq(bills.billNumber, billNumber));
    return bill || undefined;
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const [bill] = await db!.insert(bills).values(insertBill).returning();
    return bill;
  }

  async updateBill(id: number, updates: Partial<InsertBill>): Promise<Bill | undefined> {
    const [bill] = await db!.update(bills).set(updates).where(eq(bills.id, id)).returning();
    return bill || undefined;
  }

  async getCouncilMembers(): Promise<CouncilMember[]> {
    return await db!.select().from(councilMembers);
  }

  async getCouncilMember(id: number): Promise<CouncilMember | undefined> {
    const [member] = await db!.select().from(councilMembers).where(eq(councilMembers.id, id));
    return member || undefined;
  }

  async getCouncilMembersByDistrict(district: string): Promise<CouncilMember[]> {
    return await db!.select().from(councilMembers).where(eq(councilMembers.district, district));
  }

  async createCouncilMember(insertMember: InsertCouncilMember): Promise<CouncilMember> {
    const [member] = await db!.insert(councilMembers).values(insertMember).returning();
    return member;
  }

  async getComments(billId: number): Promise<Comment[]> {
    return await db!.select().from(comments).where(eq(comments.billId, billId)).orderBy(desc(comments.timestamp));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db!.insert(comments).values(insertComment).returning();
    return comment;
  }

  async upvoteComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db!
      .update(comments)
      .set({ upvotes: sql`${comments.upvotes} + 1` })
      .where(eq(comments.id, id))
      .returning();
    return comment || undefined;
  }

  async getUserVote(billId: number, userId: number): Promise<UserVote | undefined> {
    const [vote] = await db!
      .select()
      .from(userVotes)
      .where(and(eq(userVotes.billId, billId), eq(userVotes.userId, userId)));
    return vote || undefined;
  }

  async createUserVote(insertVote: InsertUserVote): Promise<UserVote> {
    const [vote] = await db!.insert(userVotes).values(insertVote).returning();

    if (insertVote.vote === "support") {
      await db!.update(bills).set({ supportVotes: sql`${bills.supportVotes} + 1` }).where(eq(bills.id, insertVote.billId));
    } else if (insertVote.vote === "oppose") {
      await db!.update(bills).set({ opposeVotes: sql`${bills.opposeVotes} + 1` }).where(eq(bills.id, insertVote.billId));
    }

    return vote;
  }

  async getCampaignContributions(councilMemberId?: number): Promise<CampaignContribution[]> {
    if (councilMemberId) {
      return await db!.select().from(campaignContributions).where(eq(campaignContributions.councilMemberId, councilMemberId));
    }
    return await db!.select().from(campaignContributions);
  }

  async createCampaignContribution(insertContribution: InsertCampaignContribution): Promise<CampaignContribution> {
    const [contribution] = await db!.insert(campaignContributions).values(insertContribution).returning();
    return contribution;
  }

  async getCouncilVotes(billId: number): Promise<(CouncilVote & { councilMember?: CouncilMember })[]> {
    const votes = await db!
      .select()
      .from(councilVotes)
      .leftJoin(councilMembers, eq(councilVotes.councilMemberId, councilMembers.id))
      .where(eq(councilVotes.billId, billId));
    
    return votes.map(v => ({
      ...v.council_votes,
      councilMember: v.council_members || undefined
    }));
  }

  async createCouncilVote(insertVote: InsertCouncilVote): Promise<CouncilVote> {
    const [vote] = await db!.insert(councilVotes).values(insertVote).returning();
    return vote;
  }

  async getBillTimeline(billId: number): Promise<BillTimeline[]> {
    return await db!.select().from(billTimeline).where(eq(billTimeline.billId, billId));
  }

  async createBillTimelineEvent(insertEvent: InsertBillTimeline): Promise<BillTimeline> {
    const [event] = await db!.insert(billTimeline).values(insertEvent).returning();
    return event;
  }

  async getJurisdictions(): Promise<Jurisdiction[]> {
    return await db!.select().from(jurisdictions).where(eq(jurisdictions.isActive, true));
  }

  async getJurisdiction(id: number): Promise<Jurisdiction | undefined> {
    const [jurisdiction] = await db!.select().from(jurisdictions).where(eq(jurisdictions.id, id));
    return jurisdiction || undefined;
  }

  async getJurisdictionBySlug(slug: string): Promise<Jurisdiction | undefined> {
    const [jurisdiction] = await db!.select().from(jurisdictions).where(eq(jurisdictions.slug, slug));
    return jurisdiction || undefined;
  }

  async getZipcodes(jurisdictionId?: number): Promise<Zipcode[]> {
    if (jurisdictionId) {
      return await db!.select().from(zipcodes).where(eq(zipcodes.jurisdictionId, jurisdictionId));
    }
    return await db!.select().from(zipcodes);
  }

  async getZipcode(zipcode: string): Promise<(Zipcode & { jurisdiction?: Jurisdiction }) | undefined> {
    const result = await db!
      .select()
      .from(zipcodes)
      .leftJoin(jurisdictions, eq(zipcodes.jurisdictionId, jurisdictions.id))
      .where(eq(zipcodes.zipcode, zipcode));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].zipcodes,
      jurisdiction: result[0].jurisdictions || undefined
    };
  }

  async getAmendments(billId: number): Promise<Amendment[]> {
    return await db!.select().from(amendments).where(eq(amendments.billId, billId));
  }

  async createAmendment(insertAmendment: InsertAmendment): Promise<Amendment> {
    const [amendment] = await db!.insert(amendments).values(insertAmendment).returning();
    return amendment;
  }

  async starBill(userId: number, billId: number): Promise<BillStar> {
    const existing = await db!.select().from(billStars)
      .where(and(eq(billStars.userId, userId), eq(billStars.billId, billId)));

    if (existing.length > 0) {
      return existing[0];
    }

    const [star] = await db!.insert(billStars).values({ userId, billId }).returning();
    return star;
  }

  async unstarBill(userId: number, billId: number): Promise<void> {
    await db!.delete(billStars)
      .where(and(eq(billStars.userId, userId), eq(billStars.billId, billId)));
  }

  async isStarred(userId: number, billId: number): Promise<boolean> {
    const [star] = await db!.select().from(billStars)
      .where(and(eq(billStars.userId, userId), eq(billStars.billId, billId)));
    return !!star;
  }

  async getStarredBills(userId: number): Promise<(BillStar & { bill: Bill })[]> {
    const results = await db!.select()
      .from(billStars)
      .leftJoin(bills, eq(billStars.billId, bills.id))
      .where(eq(billStars.userId, userId))
      .orderBy(desc(billStars.createdAt));

    return results.map(r => ({
      ...r.bill_stars,
      bill: r.bills!
    }));
  }

  async getUserComments(userId: number): Promise<(Comment & { bill?: Bill })[]> {
    const results = await db!.select()
      .from(comments)
      .leftJoin(bills, eq(comments.billId, bills.id))
      .where(eq(comments.userId, userId))
      .orderBy(desc(comments.timestamp));

    return results.map(r => ({
      ...r.comments,
      bill: r.bills || undefined
    }));
  }

  async subscribeToNewsletter(email: string): Promise<NewsletterSubscription> {
    const [subscription] = await db!.insert(newsletterSubscriptions)
      .values({ email, isActive: true })
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: { isActive: true, unsubscribedAt: null }
      })
      .returning();
    return subscription;
  }
}

// NoOpStorage returns empty/safe defaults when database is not configured
// This prevents crashes in routes that call storage methods
export class NoOpStorage implements IStorage {
  async getUser(_id: number): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(_username: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByEmail(_email: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(_user: InsertUser): Promise<User> {
    throw new Error("Database not configured - cannot create user");
  }

  async getZipcodeByCode(_zipcode: string): Promise<Zipcode | undefined> {
    return undefined;
  }

  async getBills(_filters?: { topic?: string; status?: string; zipcode?: string; search?: string }): Promise<Bill[]> {
    return [];
  }

  async getBill(_id: number): Promise<Bill | undefined> {
    return undefined;
  }

  async getBillByNumber(_billNumber: string): Promise<Bill | undefined> {
    return undefined;
  }

  async createBill(_bill: InsertBill): Promise<Bill> {
    throw new Error("Database not configured - cannot create bill");
  }

  async updateBill(_id: number, _updates: Partial<InsertBill>): Promise<Bill | undefined> {
    throw new Error("Database not configured - cannot update bill");
  }

  async getCouncilMembers(): Promise<CouncilMember[]> {
    return [];
  }

  async getCouncilMember(_id: number): Promise<CouncilMember | undefined> {
    return undefined;
  }

  async getCouncilMembersByDistrict(_district: string): Promise<CouncilMember[]> {
    return [];
  }

  async createCouncilMember(_member: InsertCouncilMember): Promise<CouncilMember> {
    throw new Error("Database not configured - cannot create council member");
  }

  async getComments(_billId: number): Promise<Comment[]> {
    return [];
  }

  async createComment(_comment: InsertComment): Promise<Comment> {
    throw new Error("Database not configured - cannot create comment");
  }

  async upvoteComment(_id: number): Promise<Comment | undefined> {
    throw new Error("Database not configured - cannot upvote comment");
  }

  async getUserVote(_billId: number, _userId: number): Promise<UserVote | undefined> {
    return undefined;
  }

  async createUserVote(_vote: InsertUserVote): Promise<UserVote> {
    throw new Error("Database not configured - cannot create vote");
  }

  async getCampaignContributions(_councilMemberId?: number): Promise<CampaignContribution[]> {
    return [];
  }

  async createCampaignContribution(_contribution: InsertCampaignContribution): Promise<CampaignContribution> {
    throw new Error("Database not configured - cannot create contribution");
  }

  async getCouncilVotes(_billId: number): Promise<(CouncilVote & { councilMember?: CouncilMember })[]> {
    return [];
  }

  async createCouncilVote(_vote: InsertCouncilVote): Promise<CouncilVote> {
    throw new Error("Database not configured - cannot create council vote");
  }

  async getBillTimeline(_billId: number): Promise<BillTimeline[]> {
    return [];
  }

  async createBillTimelineEvent(_event: InsertBillTimeline): Promise<BillTimeline> {
    throw new Error("Database not configured - cannot create timeline event");
  }

  async getJurisdictions(): Promise<Jurisdiction[]> {
    return [];
  }

  async getJurisdiction(_id: number): Promise<Jurisdiction | undefined> {
    return undefined;
  }

  async getJurisdictionBySlug(_slug: string): Promise<Jurisdiction | undefined> {
    return undefined;
  }

  async getZipcodes(_jurisdictionId?: number): Promise<Zipcode[]> {
    return [];
  }

  async getZipcode(_zipcode: string): Promise<(Zipcode & { jurisdiction?: Jurisdiction }) | undefined> {
    return undefined;
  }

  async getAmendments(_billId: number): Promise<Amendment[]> {
    return [];
  }

  async createAmendment(_amendment: InsertAmendment): Promise<Amendment> {
    throw new Error("Database not configured - cannot create amendment");
  }

  async starBill(_userId: number, _billId: number): Promise<BillStar> {
    throw new Error("Database not configured - cannot star bill");
  }

  async unstarBill(_userId: number, _billId: number): Promise<void> {
    throw new Error("Database not configured - cannot unstar bill");
  }

  async isStarred(_userId: number, _billId: number): Promise<boolean> {
    return false;
  }

  async getStarredBills(_userId: number): Promise<(BillStar & { bill: Bill })[]> {
    return [];
  }

  async getUserComments(_userId: number): Promise<(Comment & { bill?: Bill })[]> {
    return [];
  }

  async subscribeToNewsletter(email: string): Promise<NewsletterSubscription> {
    // Return a mock subscription when database is not configured
    return {
      id: 1,
      email,
      isActive: true,
      subscribedAt: new Date(),
      unsubscribedAt: null
    };
  }
}

// Use NoOpStorage when database is not configured to prevent crashes
export const storage = db ? new DatabaseStorage() : new NoOpStorage();
