import { Router } from "itty-router";
import { Env } from "./@types";

const router = Router();

router.get(
  "/",
  async (request: Request, env: Env, context: ExecutionContext) => {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (typeof key !== "string")
      return new Response("Key should be string", {
        status: 403,
      });

    const result = await env.DB.get(key);
    if (result === null)
      return new Response(`${key} not founded`, {
        status: 404,
      });
    return new Response(JSON.stringify({ key, value: result }, null, 2), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
);

router.get(
  "/list",
  async (request: Request, env: Env, context: ExecutionContext) => {
    const keys = (await env.DB.list()).keys.map((key) => key.name);

    const list = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await env.DB.get(key),
      }))
    );

    return new Response(JSON.stringify(list, null, 2), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
);

router.post(
  "/",
  async (request: Request, env: Env, context: ExecutionContext) => {
    const { key, value } = await request.json<{
      key?: string;
      value?: string;
    }>();
    if (key === undefined || value === undefined)
      return new Response("Key or Value cannot be null", {
        status: 403,
      });

    await env.DB.put(key, value);
    return new Response("Data added");
  }
);

router.delete(
  "/",
  async (request: Request, env: Env, context: ExecutionContext) => {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (typeof key !== "string")
      return new Response("Key should be string", {
        status: 403,
      });

    await env.DB.delete(key);
    return new Response("Data deleted");
  }
);

// simple module version
export default {
  fetch: router.handle, // CF passes request, env, and context to this function
};
