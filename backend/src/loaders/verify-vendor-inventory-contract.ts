import fs from "fs";
import path from "path";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type InventoryRouteContract = {
  route: string;
  localRouteFile: string;
};

const CONTRACT: InventoryRouteContract[] = [
  {
    route: "/vendor/inventory-items",
    localRouteFile: "api/vendor/inventory-items/route.ts",
  },
  {
    route: "/vendor/reservations",
    localRouteFile: "api/vendor/reservations/route.ts",
  },
  {
    route: "/vendor/stock-locations",
    localRouteFile: "api/vendor/stock-locations/route.ts",
  },
];

const SRC_DIR = path.resolve(process.cwd(), "src");
const PROJECT_DIR = process.cwd();

const hasMercurVendorPlugin = (): boolean => {
  const packageJsonPath = path.join(PROJECT_DIR, "package.json");

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return Boolean(
      pkg.dependencies?.["@mercurjs/b2c-core"] ||
      pkg.devDependencies?.["@mercurjs/b2c-core"],
    );
  } catch {
    return false;
  }
};

export default async function verifyVendorInventoryContract(
  container: MedusaContainer,
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const hasPluginProvider = hasMercurVendorPlugin();

  const missingRoutes = CONTRACT.filter((entry) => {
    const localRoutePath = path.join(SRC_DIR, entry.localRouteFile);
    const hasLocalProvider = fs.existsSync(localRoutePath);

    return !hasLocalProvider && !hasPluginProvider;
  });

  if (missingRoutes.length > 0) {
    const routes = missingRoutes.map((r) => r.route).join(", ");

    throw new Error(
      `[Vendor Inventory Contract] Missing route providers for critical vendor endpoints: ${routes}. ` +
        `Provide local route files in src/api/vendor/* or include @mercurjs/b2c-core plugin.`,
    );
  }

  logger.info(
    `[Vendor Inventory Contract] Verified route providers for ${CONTRACT.length} critical endpoints.`,
  );
}
