const Counter = require("../models/Counter");

const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const counterId = `complaint_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  return `CMP-${year}-${String(counter.seq).padStart(5, "0")}`;
};

module.exports = generateComplaintId;
