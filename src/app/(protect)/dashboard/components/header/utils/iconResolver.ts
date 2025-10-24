import React from "react";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FlagIcon from "@mui/icons-material/Flag";
import SavingsIcon from "@mui/icons-material/Savings";

export type IconName =
  | "Event"
  | "Add"
  | "Logout"
  | "AccountCircle"
  | "CreditCard"
  | "Flag"
  | "Savings";

export function resolveIcon(icon?: IconName | React.ReactNode) {
  if (!icon) return undefined;
  if (typeof icon !== "string") return icon;
  switch (icon) {
    case "Event":
      return React.createElement(EventIcon);
    case "Add":
      return React.createElement(AddIcon);
    case "Logout":
      return React.createElement(LogoutIcon);
    case "AccountCircle":
      return React.createElement(AccountCircleIcon);
    case "CreditCard":
      return React.createElement(CreditCardIcon);
    case "Flag":
      return React.createElement(FlagIcon);
    case "Savings":
      return React.createElement(SavingsIcon);
    default:
      return undefined;
  }
}
