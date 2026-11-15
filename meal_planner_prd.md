# Product Requirements Document (PRD)

## Weekly Meal Planner and Tracker

**Status:** Draft v1.1\
**Product Type:** Personal-use household web application\
**Platform:** Web (desktop and mobile)\
**Primary Stack:** Python, FastAPI, Jinja2, SQLAlchemy, PostgreSQL\
**Hosting:** Vercel (application), Supabase (database)\
**Code Repository:** Github\
**Database Hosting:** Supabase

## 1. Product Overview

### Problem Statement

Managing household meals, food inventory, expiration dates, and grocery
shopping across spreadsheets creates friction when planning meals,
tracking available ingredients, and deciding what to purchase across desktop and mobile mediums.

### Product Vision

Build a centralized household meal-planning application that connects
weekly meal plans, food inventory, and grocery lists to simplify meal
preparation, reduce food waste, and make grocery shopping more
efficient.

### Product Goals

-   Simplify weekly meal planning across breakfast, lunch, and dinner.
-   Track food inventory by storage location.
-   Track expiration dates to prioritize food that should be used soon.
-   Organize grocery lists by designated stores.
-   Is accessible between devices with an internet connection.
-   Keep the initial experience straightforward and suitable for personal use.
-   Establish a foundation for automated meal suggestions and grocery
    generation.

## 2. Target Users
The initial target user is an individual managing their household meals, food inventory, and grocery shopping. Multi-user household access may be considered in a later version.

## 3. Scope and Prioritization

### MVP --- Version 1

The MVP will support manual entry and management of meal plans,
inventory, and grocery lists.

  -----------------------------------------------------------------------
  Feature                 Priority                Description
  ----------------------- ----------------------- -----------------------
  Weekly meal planner     P0                      Create and edit meals
                                                  by day and meal type

  Food inventory          P0                      Add, view, edit, and
                                                  remove household food
                                                  items

  Storage tracking        P0                      Categorize items by
                                                  fridge, freezer,
                                                  pantry, or counter

  Expiration tracking     P0                      Record expiration dates
                                                  and identify items
                                                  expiring soon

  Grocery lists           P0                      Add, edit, check off,
                                                  and remove grocery
                                                  items

  Store organization      P0                      Group grocery items by
                                                  designated store

  Persistent database     P0                      Save information across
                                                  sessions

  Recipe management       P1                      Save reusable recipes
                                                  and ingredients

  Inventory-aware         P2                      Recommend meals based
  suggestions                                     on available
                                                  ingredients

  Automated grocery       P2                      Compare planned meals
  generation                                      with inventory to
                                                  suggest purchases
  -----------------------------------------------------------------------

**P0:** Required for the initial usable product.\
**P1:** Valuable next-stage functionality.\
**P2:** Future automation after the core workflows are reliable.

## 4. Functional Requirements

### 4.1 Weekly Meal Planner

**Objective:** Allow users to plan meals for a selected week.

**Requirements**

-   Display seven days of the selected week.
-   Provide breakfast, lunch, and dinner slots for each day.
-   Allow users to add, edit, and delete a meal.
-   Support free-text meal names and optional notes.
-   Save meal plans between sessions.
-   Allow navigation between weeks.

**Acceptance criteria**

-   A user can add a meal to any day and meal slot.
-   A user can edit or delete a planned meal.
-   Meals remain associated with the correct date and meal type after
    refreshing the page.
-   Users can navigate to another week without losing saved plans.

### 4.2 Food Inventory Management

**Objective:** Provide a centralized record of household food.

**Requirements**

-   Add food items manually.
-   Record item name, quantity, unit, storage location, date added, and
    optional expiration date.
-   Support four storage locations: fridge, freezer, pantry, and
    counter.
-   Edit item details and quantities.
-   Remove items that have been consumed, discarded, or are no longer
    tracked.
-   Filter or group inventory by storage location.
-   Highlight items that are expired or approaching expiration.

**Acceptance criteria**

-   Users can create, update, and delete inventory entries.
-   Each item can be assigned to one supported storage location.
-   Items with expiration dates can be sorted by expiration date.
-   Items without expiration dates remain valid inventory records.
-   Updating an item's quantity or location persists after refreshing.

### 4.3 Grocery List Management

**Objective:** Organize household grocery needs into actionable shopping
lists.

**Requirements**

-   Add grocery items manually.
-   Record item name, quantity, unit, designated store, and optional
    notes.
-   Support configurable or predefined stores, initially Costco and
    Trader Joe's.
-   Group items by store.
-   Allow users to mark items as purchased.
-   Allow users to edit and remove items.
-   Preserve unchecked items until they are purchased or removed.

**Acceptance criteria**

-   Users can add grocery items and assign them to a store.
-   Grocery items display under the correct store grouping.
-   Users can check off purchased items.
-   Users can edit quantities and remove items.
-   Grocery list data persists between sessions.

### 4.4 Navigation and Dashboard

**Objective:** Make core household workflows easy to access.

**Requirements**

-   Provide navigation between Meal Planner, Inventory, and Grocery
    List.
-   Display the current week's meal plan by default.
-   Provide quick access to inventory items approaching expiration.
-   Provide quick access to the grocery list.
-   Keep navigation usable on desktop and mobile screens.

**Acceptance criteria**

-   Users can move between the three primary sections without losing
    saved data.
-   The dashboard surfaces relevant expiration information when
    available.
-   Core features remain accessible on a mobile browser.

### 4.5 User Access and Availability

**Objective:** Make the application accessible across devices.

**Requirements**

-   Host the application on Vercel.
-   Make the application accessible through a public or private application URL.
-   Support desktop and mobile browser layouts.
-   Store application data independently of the hosting environment.
-   Ensure application data persists when the application is redeployed or restarted.
-   Protect database credentials and application secrets using environment variables.

**Acceptance criteria**

-   Users can access the application from their phone and computer.
-   Changes made on one device are reflected when accessing the application from another device.
-   Application data remains available after redeployment.
-   The application does not depend on a local computer remaining online.

## 5. Data Model

The initial database should use the following core entities.

  -----------------------------------------------------------------------
  Entity                              Key fields
  ----------------------------------- -----------------------------------
  MealPlanEntry                       ID, date, meal type, meal name,
                                      notes

  InventoryItem                       ID, item name, quantity, unit,
                                      location, date added, expiration
                                      date

  GroceryItem                         ID, item name, quantity, unit,
                                      store, notes, purchased status

  Store                               ID, store name, active status
  -----------------------------------------------------------------------

Future entities may include Recipe, RecipeIngredient, and
RecipeMealPlanEntry.

**Data Requirements**

-   Use Supabase PostgreSQL as the persistent database.
-   Use SQLAlchemy to interact with PostgreSQL.
-   Use Alembic to manage database schema changes.
-   Configure a secure database connection using environment variables.
-   Use Supabase connection pooling where appropriate for serverless deployment.
-   Use unique IDs for records.
-   Store dates in appropriate database date fields.
-   Validate quantities and required fields.
-   Define how inventory entries with duplicate item names are handled.
-   Keep storage locations and meal types restricted to supported
    values.

## 6. Nonfunctional Requirements

-   **Usability:** Core tasks should be possible through straightforward
    forms and lists.
-   **Persistence:** Data must survive page refreshes and application
    restarts.
-   **Availability:** The application should remain accessible online without requiring a local computer to run.
-   **Reliability:** Invalid input should produce clear errors rather
    than silently corrupting data.
-   **Maintainability:** Keep routes, database models, templates, and
    business logic organized separately.
-   **Privacy:** The initial application is for personal household use
    and should not expose data publicly.
-   **Responsive design:** Support desktop and mobile browser layouts.
-   **Data integrity:** Prevent invalid dates, unsupported locations,
    and malformed quantities where applicable.
-   **Scalability:** Maintain an architecture that supports additional features without requiring a complete rebuild. 

## 7. Technical Architecture

### Application stack

-   **Backend:** Python + FastAPI
-   **Frontend:** Jinja2 templates, HTML, CSS, and lightweight
    JavaScript as needed
-   **Database:** PostgreSQL
-   **ORM:** SQLAlchemy
-   **Schema migrations:** Alembic
-   **Configuration:** Environment variables and Pydantic Settings

### High-level request flow

1.  User opens a meal planning, inventory, or grocery page.
2.  FastAPI handles the request.
3.  SQLAlchemy reads or updates PostgreSQL.
4.  FastAPI returns a rendered Jinja2 template.
5.  The user submits changes through a form, and the updated information
    is saved.

### Initial application structure

-   `app/main.py` --- application setup
-   `app/routers/` --- meal, inventory, and grocery endpoints
-   `app/models/` --- database models
-   `app/schemas/` --- input validation schemas
-   `app/services/` --- business logic
-   `app/templates/` --- HTML templates
-   `app/static/` --- CSS and JavaScript
-   `alembic/` --- database migrations
-   `.env` --- local configuration, excluded from version control

## 8. MVP Success Criteria

The initial product is successful when a user can:

1.  Plan all meals for a full week.
2.  Add and maintain household food inventory across four storage
    locations.
3.  Identify food approaching expiration.
4.  Build a grocery list and organize it by store.
5.  Complete all core workflows without manually editing the underlying
    database or spreadsheet.
6.  Close and reopen the application without losing saved information.

Future success measures may include the time required to plan a week,
the percentage of meals using existing inventory, and the frequency of
unused or expired food.

## 9. Risks and Open Questions

-   **Inventory accuracy:** Manually tracked quantities may become
    outdated.
-   **Ingredient matching:** Different names and units can complicate
    recipe-to-inventory matching.
-   **Expiration data:** Some foods have estimated freshness windows
    rather than precise expiration dates.
-   **Shared access:** Multiple users may eventually need separate
    accounts and concurrent editing.
-   **Deployment:** A local application is simpler to start;
    household-wide access requires an appropriate hosting and security
    approach.
-   **Shopping workflow:** Purchased items may need to update inventory
    automatically in a later version.

## 9. Implementation Roadmap

### Phase 1 --- Foundation

-   Set up the Python environment, FastAPI application, and PostgreSQL
    database.
-   Configure SQLAlchemy and Alembic.
-   Build shared navigation and base templates.

### Phase 2 --- Core CRUD

-   Implement inventory creation, editing, filtering, and deletion.
-   Implement grocery list creation, store grouping, and purchased
    status.
-   Implement weekly meal creation, editing, and navigation.

### Phase 3 --- Usability

-   Add expiration highlighting and sorting.
-   Improve forms, validation, empty states, and mobile layouts.
-   Test persistence and common error cases.

### Phase 4 --- Recipes and Automation

-   Introduce recipe and ingredient models.
-   Connect planned recipes to inventory.
-   Generate editable grocery suggestions from missing ingredients.

**Initial release milestone:** A reliable manual-entry household
application for meal planning, inventory tracking, and store-specific
grocery management.
