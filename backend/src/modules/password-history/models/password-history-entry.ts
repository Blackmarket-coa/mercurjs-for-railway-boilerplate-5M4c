import { model } from "@medusajs/framework/utils"

/**
 * PasswordHistoryEntry model
 *
 * Stores hashed versions of old passwords to prevent password reuse.
 * When a user resets their password, the old password hash is stored here.
 * Before accepting a new password, we check if it matches any stored hashes.
 */
const PasswordHistoryEntry = model.define("password_history_entry", {
  id: model.id().primaryKey(),
  // The auth identity ID (from MedusaJS auth module)
  auth_identity_id: model.text(),
  // The actor type (customer, seller, user, driver)
  actor_type: model.text(),
  // The bcrypt hash of the old password
  password_hash: model.text(),
}).indexes([
  {
    on: ["auth_identity_id"],
    name: "IDX_pwd_history_auth_identity",
  },
  {
    on: ["actor_type"],
    name: "IDX_pwd_history_actor_type",
  },
])

export default PasswordHistoryEntry
