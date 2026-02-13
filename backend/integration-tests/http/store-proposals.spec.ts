import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe("Store proposals query validation", () => {
      it("rejects invalid pagination values", async () => {
        const response = await api.get("/store/proposals?limit=1000&offset=-1")

        expect(response.status).toBe(400)
        expect(response.data.error).toBe("Invalid proposal query parameters")
      })
    })
  },
})
