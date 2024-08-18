import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const getStatus = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, "Everything working fine"));
});

export { getStatus };
