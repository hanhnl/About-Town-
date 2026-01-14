import { db, isDatabaseConfigured } from "./db";
import { bills, councilMembers, billTimeline, councilVotes, campaignContributions, jurisdictions, zipcodes, amendments } from "@shared/schema";

export async function seed() {
  if (!isDatabaseConfigured()) {
    console.log("⚠️  Database not configured - skipping seed");
    return;
  }

  console.log("Seeding database with Montgomery County data...");

  const existingMembers = await db!.select().from(councilMembers);
  if (existingMembers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const [mcJurisdiction] = await db!.insert(jurisdictions).values({
    name: "Montgomery County",
    slug: "montgomery-county-md",
    type: "county",
    state: "MD",
    isActive: true,
    dataSourceUrl: "https://www.montgomerycountymd.gov/council/",
  }).returning();
  console.log("Created Montgomery County jurisdiction");

  const silverSpringZipcodes = [
    { zipcode: "20901", city: "Silver Spring", neighborhoods: ["Four Corners", "Woodmoor", "Indian Spring"] },
    { zipcode: "20902", city: "Silver Spring", neighborhoods: ["Wheaton", "Forest Glen", "Glenmont"] },
    { zipcode: "20903", city: "Silver Spring", neighborhoods: ["Langley Park", "Adelphi"] },
    { zipcode: "20904", city: "Silver Spring", neighborhoods: ["Colesville", "White Oak", "Hillandale"] },
    { zipcode: "20905", city: "Silver Spring", neighborhoods: ["Burtonsville", "Spencerville"] },
    { zipcode: "20906", city: "Silver Spring", neighborhoods: ["Aspen Hill", "Layhill", "Leisure World"] },
    { zipcode: "20910", city: "Silver Spring", neighborhoods: ["Downtown Silver Spring", "Sligo Park"] },
    { zipcode: "20912", city: "Takoma Park", neighborhoods: ["Takoma Park", "Long Branch"] },
    { zipcode: "20814", city: "Bethesda", neighborhoods: ["Bethesda", "Edgemoor"] },
    { zipcode: "20815", city: "Chevy Chase", neighborhoods: ["Chevy Chase", "Somerset"] },
    { zipcode: "20816", city: "Bethesda", neighborhoods: ["Cabin John", "Glen Echo"] },
    { zipcode: "20817", city: "Bethesda", neighborhoods: ["Potomac", "Carderock"] },
    { zipcode: "20852", city: "Rockville", neighborhoods: ["North Bethesda", "Pike District"] },
    { zipcode: "20853", city: "Rockville", neighborhoods: ["Rockville", "Twinbrook"] },
    { zipcode: "20854", city: "Potomac", neighborhoods: ["Potomac", "Travilah"] },
    { zipcode: "20855", city: "Derwood", neighborhoods: ["Derwood", "Shady Grove"] },
    { zipcode: "20874", city: "Germantown", neighborhoods: ["Germantown", "Clopper"] },
    { zipcode: "20876", city: "Germantown", neighborhoods: ["Germantown East", "Milestone"] },
    { zipcode: "20877", city: "Gaithersburg", neighborhoods: ["Gaithersburg", "Olde Town"] },
    { zipcode: "20878", city: "Gaithersburg", neighborhoods: ["Kentlands", "Lakelands"] },
    { zipcode: "20879", city: "Gaithersburg", neighborhoods: ["Montgomery Village"] },
  ];

  await db!.insert(zipcodes).values(
    silverSpringZipcodes.map(z => ({
      zipcode: z.zipcode,
      city: z.city,
      state: "MD",
      jurisdictionId: mcJurisdiction.id,
      neighborhoods: z.neighborhoods,
    }))
  );
  console.log(`Created ${silverSpringZipcodes.length} Montgomery County zipcodes`);

  const insertedCouncilMembers = await db!.insert(councilMembers).values([
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Natali Fani-González",
      initials: "NF",
      district: "District 6",
      email: "Councilmember.Fani-Gonzalez@montgomerycountymd.gov",
      phone: "240-777-7896",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "Council President. Represents District 6 including Wheaton, Glenmont, and Aspen Hill areas."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Marilyn Balcombe",
      initials: "MB",
      district: "District 2",
      email: "Councilmember.Balcombe@montgomerycountymd.gov",
      phone: "240-777-7955",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "Council Vice President. Represents District 2 including Germantown, Clarksburg, and Damascus."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Andrew Friedson",
      initials: "AF",
      district: "District 1",
      email: "Councilmember.Friedson@montgomerycountymd.gov",
      phone: "240-777-7828",
      party: "Democrat",
      termStart: "2018",
      termEnd: "2026",
      bio: "Represents District 1 including Bethesda, Potomac, and Chevy Chase."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Dawn Luedtke",
      initials: "DL",
      district: "District 7",
      email: "Councilmember.Luedtke@montgomerycountymd.gov",
      phone: "240-777-7860",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "Represents District 7 including Burtonsville, Colesville, and White Oak."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Laurie-Anne Sayles",
      initials: "LS",
      district: "At-Large",
      email: "Councilmember.Sayles@montgomerycountymd.gov",
      phone: "240-777-7966",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "At-Large Councilmember serving all of Montgomery County."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Will Jawando",
      initials: "WJ",
      district: "At-Large",
      email: "Councilmember.Jawando@montgomerycountymd.gov",
      phone: "240-777-7811",
      party: "Democrat",
      termStart: "2018",
      termEnd: "2026",
      bio: "At-Large Councilmember serving all of Montgomery County."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Sidney Katz",
      initials: "SK",
      district: "District 3",
      email: "Councilmember.Katz@montgomerycountymd.gov",
      phone: "240-777-7906",
      party: "Democrat",
      termStart: "2014",
      termEnd: "2026",
      bio: "Represents District 3 including Gaithersburg and Rockville areas."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Kate Stewart",
      initials: "KS",
      district: "District 4",
      email: "Councilmember.Stewart@montgomerycountymd.gov",
      phone: "240-777-7931",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "Represents District 4 including Takoma Park and Silver Spring areas."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Kristin Mink",
      initials: "KM",
      district: "District 5",
      email: "Councilmember.Mink@montgomerycountymd.gov",
      phone: "240-777-7951",
      party: "Democrat",
      termStart: "2022",
      termEnd: "2026",
      bio: "Represents District 5 including Kensington and North Bethesda."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Evan Glass",
      initials: "EG",
      district: "At-Large",
      email: "Councilmember.Glass@montgomerycountymd.gov",
      phone: "240-777-7966",
      party: "Democrat",
      termStart: "2018",
      termEnd: "2026",
      bio: "At-Large Councilmember and former Council President."
    },
    {
      jurisdictionId: mcJurisdiction.id,
      name: "Gabe Albornoz",
      initials: "GA",
      district: "At-Large",
      email: "Councilmember.Albornoz@montgomerycountymd.gov",
      phone: "240-777-7959",
      party: "Democrat",
      termStart: "2018",
      termEnd: "2026",
      bio: "At-Large Councilmember serving all of Montgomery County."
    }
  ]).returning();

  console.log(`Inserted ${insertedCouncilMembers.length} council members`);

  const insertedBills = await db!.insert(bills).values([
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "University-Blvd-2025",
      title: "University Boulevard Corridor Plan",
      summary: "A comprehensive plan to transform University Boulevard (MD 193) into a mixed-use corridor with improved transit, pedestrian safety, and affordable housing. The plan envisions converting this auto-centric thoroughfare into a walkable, bikeable community with protected bike lanes, wider sidewalks, and enhanced bus service.",
      fullText: "The University Boulevard Corridor Plan proposes significant changes to the 3.5-mile stretch of MD 193 between Connecticut Avenue and New Hampshire Avenue. Key elements include: (1) Rezoning to allow mixed-use development up to 8 stories near transit nodes, (2) Protected bike lanes on both sides of the corridor, (3) Enhanced pedestrian crossings every quarter mile, (4) 15% affordable housing requirement for new developments, (5) Stormwater management improvements, and (6) Coordination with future Purple Line extensions.",
      status: "approved",
      topic: "transportation",
      voteDate: "2025-12-09",
      introductionDate: "2024-06-15",
      effectiveDate: "2026-03-01",
      sponsorName: "Natali Fani-González",
      supportVotes: 847,
      opposeVotes: 123,
      sourceUrl: "https://montgomeryplanning.org/planning/communities/midcounty/university-boulevard-corridor-plan/",
      zipcodes: ["20902", "20903", "20904", "20783"]
    },
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "Bill-6-25",
      title: "Consumer Protection for Renters Act",
      summary: "Establishes new protections for renters in Montgomery County including limits on application fees, security deposit caps, and mandatory disclosure of rental history policies. Landlords must provide 60-day notice before rent increases over 5%.",
      fullText: "This bill amends Chapter 29 of the Montgomery County Code to provide additional consumer protections for residential tenants. The bill limits rental application fees to $50, caps security deposits at one month's rent, requires landlords to accept portable tenant screening reports, mandates disclosure of criminal background and credit check policies before application, and provides for civil penalties up to $5,000 per violation.",
      status: "in_committee",
      topic: "housing",
      introductionDate: "2025-01-14",
      sponsorName: "Will Jawando",
      cosponsors: ["Kate Stewart", "Kristin Mink"],
      supportVotes: 423,
      opposeVotes: 287,
      sourceUrl: "https://www.montgomerycountymd.gov/council/Resources/Files/agenda/cm/2025/20250114/20250114_PS1.pdf",
      zipcodes: ["20901", "20902", "20910", "20912"]
    },
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "ZTA-25-02",
      title: "Workforce Housing Incentive Zone",
      summary: "Creates new zoning incentives for developers who include at least 25% workforce housing units (affordable to households earning 60-120% of area median income). Provides density bonuses, reduced parking requirements, and expedited review for qualifying projects.",
      fullText: "This Zoning Text Amendment creates a new Workforce Housing Incentive overlay zone applicable to properties within one-quarter mile of Metro stations and bus rapid transit stops. Qualifying developments receive: (1) 20% density bonus, (2) Parking reduction of 50% from standard requirements, (3) Expedited development review process, (4) Waiver of certain impact fees. In exchange, developers must designate 25% of units for workforce housing with affordability periods of 30 years.",
      status: "public_hearing",
      topic: "zoning",
      voteDate: "2025-02-11",
      introductionDate: "2025-01-07",
      sponsorName: "Andrew Friedson",
      cosponsors: ["Sidney Katz", "Marilyn Balcombe"],
      supportVotes: 562,
      opposeVotes: 198,
      sourceUrl: "https://www.montgomerycountymd.gov/council/",
      zipcodes: ["20814", "20817", "20852", "20878"]
    },
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "Bill-8-25",
      title: "Climate Emergency Mobilization Act",
      summary: "Declares a climate emergency in Montgomery County and establishes binding targets to achieve net-zero carbon emissions by 2035. Requires all new county buildings to be all-electric and establishes a Climate Emergency Fund for community resilience projects.",
      fullText: "This legislation declares a climate emergency in Montgomery County and establishes a comprehensive framework for achieving net-zero carbon emissions. The bill creates a Climate Emergency Mobilization Office, requires annual emissions reporting, mandates all new county buildings be all-electric starting in 2026, establishes a $50 million Climate Emergency Fund for community resilience and environmental justice projects, and requires climate impact assessments for all major county decisions.",
      status: "introduced",
      topic: "environment",
      introductionDate: "2025-01-21",
      sponsorName: "Kristin Mink",
      cosponsors: ["Dawn Luedtke", "Laurie-Anne Sayles"],
      supportVotes: 312,
      opposeVotes: 445,
      sourceUrl: "https://www.montgomerycountymd.gov/green/",
      zipcodes: ["20850", "20852", "20854", "20878", "20902"]
    },
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "Bill-3-25",
      title: "Vision Zero Traffic Safety Act",
      summary: "Implements comprehensive traffic safety measures with the goal of eliminating all traffic fatalities and severe injuries by 2030. Reduces speed limits to 25 mph on residential streets and requires automated speed enforcement near schools.",
      fullText: "This bill implements Montgomery County's Vision Zero Action Plan with enforceable requirements. Key provisions include: reducing speed limits to 25 mph on all residential streets, expanding automated speed enforcement to all school zones, requiring traffic calming measures in new residential developments, establishing a $10 million annual fund for pedestrian and bicycle infrastructure, and creating a Traffic Safety Review Board to analyze all serious and fatal crashes.",
      status: "in_committee",
      topic: "public-safety",
      introductionDate: "2025-01-07",
      sponsorName: "Evan Glass",
      cosponsors: ["Natali Fani-González"],
      supportVotes: 678,
      opposeVotes: 234,
      sourceUrl: "https://www.montgomerycountymd.gov/visionzero/",
      zipcodes: ["20901", "20902", "20910", "20814", "20878"]
    },
    {
      jurisdictionId: mcJurisdiction.id,
      billNumber: "Bill-12-25",
      title: "Community Schools Initiative Act",
      summary: "Establishes 10 new community school sites that provide wraparound services including health care, mental health counseling, adult education, and family support services at public schools in underserved areas.",
      fullText: "This bill establishes Montgomery County Community Schools at 10 Title I elementary and middle schools. Community Schools serve as hubs for their neighborhoods, providing integrated student supports, expanded learning opportunities, family and community engagement, and collaborative leadership. The bill appropriates $8 million annually for Community School coordinators, partnership development, and direct services. Schools will be selected based on poverty rates, English learner populations, and community need assessments.",
      status: "public_hearing",
      topic: "education",
      voteDate: "2025-02-04",
      introductionDate: "2025-01-14",
      sponsorName: "Gabe Albornoz",
      cosponsors: ["Will Jawando", "Dawn Luedtke"],
      supportVotes: 892,
      opposeVotes: 67,
      sourceUrl: "https://www.montgomeryschoolsmd.org/",
      zipcodes: ["20902", "20903", "20904", "20912", "20783"]
    }
  ]).returning();

  console.log(`Inserted ${insertedBills.length} bills`);

  const uniBlvdBill = insertedBills.find(b => b.billNumber === "University-Blvd-2025");
  const consumerBill = insertedBills.find(b => b.billNumber === "Bill-6-25");
  
  if (uniBlvdBill) {
    await db!.insert(billTimeline).values([
      { billId: uniBlvdBill.id, date: "2024-06-15", title: "Plan Initiated", description: "Montgomery Planning begins community outreach", status: "completed", type: "introduced" },
      { billId: uniBlvdBill.id, date: "2024-09-20", title: "Community Meetings", description: "Series of 6 community meetings held along corridor", status: "completed", type: "hearing" },
      { billId: uniBlvdBill.id, date: "2025-03-15", title: "Draft Plan Released", description: "Draft plan published for 60-day public comment", status: "completed", type: "committee" },
      { billId: uniBlvdBill.id, date: "2025-07-22", title: "Planning Board Review", description: "Planning Board unanimously recommends approval", status: "completed", type: "committee" },
      { billId: uniBlvdBill.id, date: "2025-10-08", title: "Council Committee", description: "Planning, Housing and Parks Committee review", status: "completed", type: "committee" },
      { billId: uniBlvdBill.id, date: "2025-12-09", title: "Council Vote", description: "County Council approves plan 9-2", status: "completed", type: "vote" },
      { billId: uniBlvdBill.id, date: "2026-03-01", title: "Implementation Begins", description: "Phased implementation of corridor improvements", status: "upcoming", type: "enacted" }
    ]);
    console.log("Added timeline for University Boulevard plan");

    for (const member of insertedCouncilMembers) {
      const vote = ["Natali Fani-González", "Marilyn Balcombe", "Andrew Friedson", "Dawn Luedtke", 
        "Laurie-Anne Sayles", "Will Jawando", "Sidney Katz", "Kate Stewart", "Gabe Albornoz"].includes(member.name) 
        ? "yes" : "no";
      await db!.insert(councilVotes).values({
        billId: uniBlvdBill.id,
        councilMemberId: member.id,
        vote
      });
    }
    console.log("Added council votes for University Boulevard plan");
  }

  for (const member of insertedCouncilMembers) {
    await db!.insert(campaignContributions).values([
      { councilMemberId: member.id, donorCategory: "Individual Contributions", amount: Math.floor(Math.random() * 50000) + 30000, percentage: 45, cycle: "2022" },
      { councilMemberId: member.id, donorCategory: "Small Donor Match", amount: Math.floor(Math.random() * 40000) + 20000, percentage: 25, cycle: "2022" },
      { councilMemberId: member.id, donorCategory: "Labor Unions", amount: Math.floor(Math.random() * 20000) + 10000, percentage: 15, cycle: "2022" },
      { councilMemberId: member.id, donorCategory: "Business PACs", amount: Math.floor(Math.random() * 15000) + 5000, percentage: 10, cycle: "2022" },
      { councilMemberId: member.id, donorCategory: "Other PACs", amount: Math.floor(Math.random() * 10000) + 2000, percentage: 5, cycle: "2022" }
    ]);
  }
  console.log("Added campaign contribution data for all council members");

  const zoneBill = insertedBills.find(b => b.billNumber === "ZTA-25-02");
  if (zoneBill) {
    await db!.insert(amendments).values([
      {
        billId: zoneBill.id,
        amendmentNumber: "ZTA-25-02-A1",
        title: "Inclusionary Housing Percentage Increase",
        summary: "Increases the minimum affordable housing requirement from 12.5% to 15% of total units for developments over 50 units in Commercial-Residential zones.",
        sponsorName: "Gabe Albornoz",
        status: "passed",
        voteDate: "2025-01-28",
        yesVotes: 8,
        noVotes: 3,
        sourceUrl: "https://www.montgomerycountymd.gov/COUNCIL/leg/zta/index.html"
      },
      {
        billId: zoneBill.id,
        amendmentNumber: "ZTA-25-02-A2",
        title: "Green Building Standards Enhancement",
        summary: "Requires new developments to achieve LEED Gold certification or equivalent, up from LEED Silver. Adds solar-ready rooftop requirements.",
        sponsorName: "Dawn Luedtke",
        status: "passed",
        voteDate: "2025-01-28",
        yesVotes: 9,
        noVotes: 2,
        sourceUrl: "https://montgomeryplanning.org/development/zoning/"
      },
      {
        billId: zoneBill.id,
        amendmentNumber: "ZTA-25-02-A3",
        title: "Parking Reduction Near Transit",
        summary: "Would have reduced minimum parking requirements by 50% for developments within 0.5 miles of Metro stations. Developers could provide car-share spaces instead.",
        sponsorName: "Will Jawando",
        status: "failed",
        voteDate: "2025-01-28",
        yesVotes: 4,
        noVotes: 7,
        sourceUrl: null
      },
      {
        billId: zoneBill.id,
        amendmentNumber: "ZTA-25-02-A4",
        title: "Community Benefit Agreement Requirement",
        summary: "Requires developments over 200 units to negotiate community benefit agreements with neighborhood associations, including local hiring and small business support commitments.",
        sponsorName: "Kate Stewart",
        status: "passed",
        voteDate: "2025-01-28",
        yesVotes: 7,
        noVotes: 4,
        sourceUrl: "https://www.montgomerycountymd.gov/council/"
      }
    ]);
    console.log("Added amendments for Workforce Housing Incentive Zone ZTA");
  }

  if (uniBlvdBill) {
    await db!.insert(amendments).values([
      {
        billId: uniBlvdBill.id,
        amendmentNumber: "UB-2025-A1",
        title: "Protected Bike Lane Extension",
        summary: "Extends protected bike lanes from Wheaton Metro to Langley Park, adding 2.3 additional miles of dedicated cycling infrastructure.",
        sponsorName: "Kristin Mink",
        status: "passed",
        voteDate: "2025-12-09",
        yesVotes: 10,
        noVotes: 1,
        sourceUrl: "https://montgomeryplanning.org/planning/transportation/"
      },
      {
        billId: uniBlvdBill.id,
        amendmentNumber: "UB-2025-A2",
        title: "Small Business Relocation Assistance",
        summary: "Establishes $2M fund to assist small businesses displaced during construction with temporary relocation costs, signage, and marketing support.",
        sponsorName: "Sidney Katz",
        status: "passed",
        voteDate: "2025-12-09",
        yesVotes: 11,
        noVotes: 0,
        sourceUrl: null
      }
    ]);
    console.log("Added amendments for University Boulevard plan");
  }

  console.log("Database seeding complete!");
}

