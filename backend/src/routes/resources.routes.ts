import { Router } from "express";
import * as resourcesController from "../controllers/resources.controller";

export const resourcesRouter = Router();

resourcesRouter.get("/", resourcesController.list);
resourcesRouter.get("/due", resourcesController.due); // polled by the notification scheduler
resourcesRouter.post("/", resourcesController.create);
resourcesRouter.patch("/:id", resourcesController.update);
resourcesRouter.delete("/:id", resourcesController.remove);
