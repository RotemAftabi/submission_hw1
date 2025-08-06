import { useAuth } from "../contexts/AuthContext";

export default function Notification() {
  const { state } = useAuth();
  const { notification } = state;

  return <div className="notification">{notification}</div>;
}
