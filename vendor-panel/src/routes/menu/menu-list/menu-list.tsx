import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Container, Heading, Button, Text, Badge, Tabs } from "@medusajs/ui"
import { Plus, PencilSquare, Trash } from "@medusajs/icons"
import { SingleColumnPage } from "../../../components/layout/pages"

/**
 * MenuList - Restaurant menu management
 *
 * This page allows restaurant vendors to manage their menu items
 * organized by categories.
 */
export function MenuList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("items")

  return (
    <SingleColumnPage>
      <Container className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading level="h1" className="text-2xl font-serif text-warm-900">
              Menu Management
            </Heading>
            <Text className="text-warm-600 mt-1">
              Manage your restaurant menu items and categories
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/menu/items/create")}
          >
            <Plus className="mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="items">
              Menu Items
            </Tabs.Trigger>
            <Tabs.Trigger value="categories">
              Categories
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="items" className="mt-6">
            <MenuItemsPlaceholder />
          </Tabs.Content>

          <Tabs.Content value="categories" className="mt-6">
            <MenuCategoriesPlaceholder />
          </Tabs.Content>
        </Tabs>
      </Container>
      <Outlet />
    </SingleColumnPage>
  )
}

function MenuItemsPlaceholder() {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <PencilSquare className="w-8 h-8 text-warm-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Menu Items Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          Start building your restaurant menu by adding your first item.
          Menu items will appear here organized by category.
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          Create Your First Menu Item
        </Button>
      </div>
    </div>
  )
}

function MenuCategoriesPlaceholder() {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <PencilSquare className="w-8 h-8 text-warm-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Categories Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          Create categories to organize your menu items (e.g., Appetizers, Main Courses, Desserts).
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          Create Category
        </Button>
      </div>
    </div>
  )
}

export const Component = MenuList
