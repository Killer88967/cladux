import { spawn } from "node:child_process";
import { allDeps, readPackageJson, type PackageManager } from "./detect.ts";
import { output } from "./ui.ts";

/** "@base-ui/react@^1.9.0" -> "@base-ui/react" */
export const depName = (spec: string) => spec.replace(/(?!^)@.*$/, "");

/** The packages from `specs` the project doesn't have yet. */
export async function missingDeps(root: string, specs: string[]) {
  const have = allDeps(await readPackageJson(root));
  return [...new Set(specs)].filter((spec) => !have[depName(spec)]);
}

export function install(root: string, pm: PackageManager, specs: string[]) {
  if (!specs.length) return Promise.resolve();
  const args = pm === "npm" ? ["install", ...specs] : ["add", ...specs];
  return new Promise<void>((resolve, reject) => {
    const child = spawn(pm, args, {
      cwd: root,
      stdio: output.silent ? "ignore" : "inherit",
      // Windows runs package managers through .cmd shims.
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${pm} ${args.join(" ")} exited with ${code}`)),
    );
  });
}
