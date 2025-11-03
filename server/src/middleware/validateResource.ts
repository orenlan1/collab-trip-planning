import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

const validateResource =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as any;
      
      // Replace req.body with the parsed/transformed data
      req.body = result.body;
      
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          error: "Validation failed",
          details: err.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        });
      }
      
      return res.status(400).json({ error: "Invalid request data" });
    }
  };

export default validateResource;