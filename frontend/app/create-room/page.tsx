import React from "react";
import CreateRoomScreen from "@/components/screens/CreateRoomScreen";

export default function CreateRoom() {
  return (
    <React.Suspense fallback={<div>Đang tải...</div>}>
      <CreateRoomScreen />
    </React.Suspense>
  );
}
