"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { apiSlice } from "@/store/api/base";
import { useAppSelector } from "./use-app-dispatch";

export function useSocket() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      connectedRef.current = false;
      return;
    }

    if (connectedRef.current) return;

    const socket = connectSocket(accessToken);
    connectedRef.current = true;

    socket.on("notification:new", () => {
      dispatch(
        apiSlice.util.invalidateTags([
          { type: "Notification", id: "LIST" },
          { type: "Notification", id: "UNREAD_COUNT" },
        ]),
      );
    });

    socket.on("enrollment:new", () => {
      dispatch(
        apiSlice.util.invalidateTags([
          { type: "Enrollment", id: "MY_LIST" },
          { type: "Analytics" },
        ]),
      );
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [isAuthenticated, accessToken, dispatch]);
}
