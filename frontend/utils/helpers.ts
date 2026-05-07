// Format time in seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Generate room code
export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Color for avatar
export const getAvatarColor = (index: number): string => {
  const colors = [
    "#7C3AED", // purple
    "#06B6D4", // cyan
    "#F59E0B", // gold
    "#10B981", // green
    "#EF4444", // red
    "#EC4899", // pink
  ];
  return colors[index % colors.length];
};

// Format date to readable string
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Get rank badge color
export const getRankColor = (rank: number): "gold" | "silver" | "bronze" => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "gold"; // fallback
};
