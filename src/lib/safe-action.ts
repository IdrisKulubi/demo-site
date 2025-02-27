import { z } from "zod";
import { ActionResult } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeAction = <TInput extends z.ZodTypeAny, TOutput = any>(
  schema: TInput,
  action: (input: z.infer<TInput>) => Promise<ActionResult<TOutput>>
) => {
  return async (input: TInput) => {
    try {
      const parsed = await schema.parseAsync(input);
      return await action(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map(e => e.message).join(", ")
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAction<TInput extends z.ZodTypeAny, TOutput = any> = ReturnType<typeof safeAction<TInput, TOutput>>; 