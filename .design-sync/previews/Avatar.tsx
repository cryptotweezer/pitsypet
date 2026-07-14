import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "pitsypet";

export function Fallbacks() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MX</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LU</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>BE</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MX</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>LU</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+2</AvatarGroupCount>
    </AvatarGroup>
  );
}
