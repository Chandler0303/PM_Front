/** 全局唯一数据中心 **/

import { init, Models, RematchDispatch, RematchRootState } from "@rematch/core";

import app from "@/models/app";

export interface RootModel extends Models<RootModel> {
  app: typeof app;
}

const rootModel: RootModel = { app };
const store = init({
  models: rootModel,
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export default store;
