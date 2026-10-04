require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Department = require("./models/Department");
const Complaint = require("./models/Complaint");
const Counter = require("./models/Counter");
const { classify } = require("./services/classifier");

const DEPARTMENTS = [
  { name: "Maintenance", description: "Plumbing, civil repairs, water issues" },
  { name: "Electrical", description: "Power, lighting, wiring, electrical safety" },
  { name: "IT / Network", description: "Internet, systems, software, hardware" },
  { name: "Cleaning", description: "Housekeeping, garbage, sanitation" },
  { name: "Security", description: "Guards, CCTV, access control, incidents" },
  { name: "Facilities", description: "Lift, parking, furniture, common facilities" },
  { name: "Other", description: "General and miscellaneous complaints" },
];

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  console.log("Creating departments...");
  const departments = await Department.insertMany(DEPARTMENTS);
  const deptByName = Object.fromEntries(departments.map((d) => [d.name, d._id]));

  console.log("Creating users...");
  const admin = await User.create({
    name: "System Administrator",
    email: "admin@smartcomplaint.com",
    password: "Admin@123",
    role: "admin",
  });

  const staffMembers = await User.create([
    {
      name: "Rahul Patil",
      email: "rahul.staff@smartcomplaint.com",
      password: "Staff@123",
      role: "staff",
      department: deptByName["Maintenance"],
    },
    {
      name: "Priya Sharma",
      email: "priya.staff@smartcomplaint.com",
      password: "Staff@123",
      role: "staff",
      department: deptByName["Electrical"],
    },
    {
      name: "Amit Kumar",
      email: "amit.staff@smartcomplaint.com",
      password: "Staff@123",
      role: "staff",
      department: deptByName["IT / Network"],
    },
  ]);

  const users = await User.create([
    {
      name: "John Dsouza",
      email: "john@example.com",
      password: "User@123",
      role: "user",
    },
    {
      name: "Sneha Kulkarni",
      email: "sneha@example.com",
      password: "User@123",
      role: "user",
    },
  ]);

  console.log("Creating sample complaints...");

  const makeComplaint = async (data, seq) => {
    const complaintId = `CMP-2026-${String(seq).padStart(5, "0")}`;
    const suggestion = classify(data.description);
    const priority = data.priority || suggestion.priority;

    const createdAt = new Date(Date.now() - (data.hoursAgo || 0) * 3600 * 1000);
    const at = (mins) => new Date(createdAt.getTime() + mins * 60 * 1000);

    const complaint = await Complaint.create({
      complaintId,
      user: data.user,
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category || suggestion.category,
      priority,
      department: data.department || deptByName["Other"],
      status: data.status || "Submitted",
      slaHours: Complaint.SLA_HOURS[priority],
      slaDueAt: new Date(
        createdAt.getTime() + Complaint.SLA_HOURS[priority] * 3600 * 1000
      ),
      createdAt,
      timeline: [{ status: "Submitted", by: data.user, at: createdAt }],
      ...(data.extra ? data.extra(createdAt, at) : {}),
    });

    return complaint;
  };

  const [c1, c2, c3, c4, c5, c6] = await Promise.all([
    makeComplaint(
      {
        hoursAgo: 24,
        user: users[0]._id,
        title: "Water leakage in Block B",
        description: "Continuous water leakage near the staircase on 2nd floor. Water is spreading to the corridor and the wall is getting damaged. Please fix urgently.",
        location: "Block B – 2nd Floor, near staircase",
        category: "Maintenance",
        priority: "High",
        department: deptByName["Maintenance"],
        status: "In Progress",
        extra: (createdAt, at) => ({
          assignedTo: staffMembers[0]._id,
          assignedBy: admin._id,
          verifiedBy: admin._id,
          timeline: [
            { status: "Submitted", by: users[0]._id, at: createdAt },
            { status: "Verified", by: admin._id, at: at(15) },
            { status: "Assigned", by: admin._id, note: "Assigned to Rahul Patil", at: at(30) },
            { status: "In Progress", by: staffMembers[0]._id, note: "Plumber inspection scheduled", at: at(60) },
          ],
        }),
      },
      1
    ),
    makeComplaint(
      {
        hoursAgo: 96,
        user: users[0]._id,
        title: "Broken classroom fan",
        description: "Ceiling fan in room 204 is not working and makes noise when switched on. Students cannot sit in the afternoon.",
        location: "Room 204, Academic Building",
        category: "Electrical",
        priority: "Medium",
        department: deptByName["Electrical"],
        status: "Assigned",
        extra: (createdAt, at) => ({
          assignedTo: staffMembers[1]._id,
          assignedBy: admin._id,
          verifiedBy: admin._id,
          timeline: [
            { status: "Submitted", by: users[0]._id, at: createdAt },
            { status: "Verified", by: admin._id, at: at(20) },
            { status: "Assigned", by: admin._id, note: "Assigned to Priya Sharma", at: at(45) },
          ],
        }),
      },
      2
    ),
    makeComplaint(
      {
        hoursAgo: 120,
        user: users[1]._id,
        title: "WiFi not working in library",
        description: "The internet in the library has been down since morning. None of the students can access online resources from the reading hall.",
        location: "Library, 1st Floor",
        category: "IT / Network",
        priority: "High",
        department: deptByName["IT / Network"],
        status: "Resolved",
        extra: (createdAt, at) => ({
          assignedTo: staffMembers[2]._id,
          assignedBy: admin._id,
          verifiedBy: admin._id,
          resolvedAt: at(1440),
          resolutionNote: "Faulty network switch replaced. WiFi restored across the library.",
          timeline: [
            { status: "Submitted", by: users[1]._id, at: createdAt },
            { status: "Verified", by: admin._id, at: at(30) },
            { status: "Assigned", by: admin._id, note: "Assigned to Amit Kumar", at: at(60) },
            { status: "In Progress", by: staffMembers[2]._id, note: "Diagnosing network switch", at: at(90) },
            { status: "Resolved", by: staffMembers[2]._id, note: "Faulty network switch replaced.", at: at(1440) },
          ],
        }),
      },
      3
    ),
    makeComplaint(
      {
        hoursAgo: 12,
        user: users[1]._id,
        title: "Garbage not collected from 3rd floor",
        description: "Dustbins on the 3rd floor have not been emptied for three days. There is a bad smell in the corridor.",
        location: "Block A – 3rd Floor corridor",
        category: "Cleaning",
        priority: "Medium",
        department: deptByName["Cleaning"],
        status: "Submitted",
      },
      4
    ),
    makeComplaint(
      {
        hoursAgo: 30,
        user: users[0]._id,
        title: "CCTV camera not working at main gate",
        description: "The security camera above the main gate seems offline since last week. Security is a concern for parked vehicles.",
        location: "Main Gate",
        category: "Security",
        priority: "High",
        department: deptByName["Security"],
        status: "Verified",
        extra: (createdAt, at) => ({
          verifiedBy: admin._id,
          timeline: [
            { status: "Submitted", by: users[0]._id, at: createdAt },
            { status: "Verified", by: admin._id, at: at(25) },
          ],
        }),
      },
      5
    ),
    makeComplaint(
      {
        hoursAgo: 72,
        user: users[1]._id,
        title: "Lift making grinding noise",
        description: "The elevator in Block C makes a loud grinding noise while moving. It feels unsafe during peak hours.",
        location: "Block C – Lift lobby",
        category: "Facilities",
        priority: "Critical",
        department: deptByName["Facilities"],
        status: "In Progress",
        extra: (createdAt, at) => ({
          assignedTo: staffMembers[0]._id,
          assignedBy: admin._id,
          verifiedBy: admin._id,
          timeline: [
            { status: "Submitted", by: users[1]._id, at: createdAt },
            { status: "Verified", by: admin._id, at: at(15) },
            { status: "Assigned", by: admin._id, at: at(40) },
            { status: "In Progress", by: staffMembers[0]._id, note: "Vendor inspection on the way", at: at(80) },
          ],
        }),
      },
      6
    ),
  ]);

  await Counter.findOneAndUpdate(
    { _id: "complaint_2026" },
    { seq: 6 },
    { upsert: true, returnDocument: "after" }
  );

  console.log("");
  console.log("===========================================");
  console.log("Seed completed successfully!");
  console.log("===========================================");
  console.log("Admin   : admin@smartcomplaint.com / Admin@123");
  console.log("Staff 1 : rahul.staff@smartcomplaint.com / Staff@123 (Maintenance)");
  console.log("Staff 2 : priya.staff@smartcomplaint.com / Staff@123 (Electrical)");
  console.log("Staff 3 : amit.staff@smartcomplaint.com / Staff@123 (IT / Network)");
  console.log("User 1  : john@example.com / User@123");
  console.log("User 2  : sneha@example.com / User@123");
  console.log("===========================================");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
