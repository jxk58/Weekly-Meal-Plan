"""Restricted value sets from the PRD (§4.1, §4.2)."""

from enum import StrEnum


class MealType(StrEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class StorageLocation(StrEnum):
    FRIDGE = "fridge"
    FREEZER = "freezer"
    PANTRY = "pantry"
    COUNTER = "counter"
