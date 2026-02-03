import { Bell, Info, LogOut, Shield, SunMoon } from "lucide-react";

export const settingsItems = [
  {
    id: "about",
    label: "About App",
    icon: Info,
    type: "component", // will render a component like <AboutApp />
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    type: "toggle", // for enabling/disabling notifications
  },
  {
    id: "password",
    label: "Password & Security",
    icon: Shield,
    type: "link", // redirect to /change-password
    to: "/change-password",
  },
  {
    id: "theme",
    label: "App Appearance",
    icon: SunMoon,
    type: "theme", // show light/dark toggle
  },
  {
    id: "logout",
    label: "Logout",
    icon: LogOut,
    type: "action", // custom function (logout)
  },
];
