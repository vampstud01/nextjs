import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserCardProps {
  name: string;
  role: string;
  email: string;
  avatar?: string;
  status: "active" | "offline" | "busy";
}

const statusColors = {
  active: "bg-green-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
};

const statusLabels = {
  active: "활성",
  offline: "오프라인",
  busy: "바쁨",
};

export function UserCard({ name, role, email, avatar, status }: UserCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusColors[status]}`}
          />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{name}</CardTitle>
          <CardDescription>{email}</CardDescription>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {statusLabels[status]}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">역할: {role}</p>
      </CardContent>
    </Card>
  );
}

