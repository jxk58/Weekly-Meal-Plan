# Services

Business logic lives here: plain async functions that take validated input, use `getDb()`, and return data. They never read `FormData`, call `redirect`/`revalidatePath`, or import React. Those belong in Server Actions and pages. Start each file with `import "server-only";`.
