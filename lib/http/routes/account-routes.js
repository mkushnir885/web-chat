import SubRouter from "../router/sub-router.js";
import sendStatic from "../controllers/send-static.js";
import {
  deleteUser,
  updateUserProfile,
} from "../controllers/account-controller.js";

const accountRouter = new SubRouter();

accountRouter.get("/", async (client) => {
  const { req } = client;
  req.url = "/account.html";
  sendStatic(client);
});

accountRouter.post("/update", updateUserProfile);

accountRouter.delete("/", deleteUser);

export default accountRouter;
