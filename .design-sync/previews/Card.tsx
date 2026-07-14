import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "pitsypet";

export function PetCard() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Bella</CardTitle>
        <CardDescription>Cavalier King Charles Spaniel · 4 yrs</CardDescription>
        <CardAction>
          <Badge variant="secondary">Low risk</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Last assessment 2 days ago — mild lethargy, resolved.
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          History
        </Button>
        <Button size="sm">New assessment</Button>
      </CardFooter>
    </Card>
  );
}

export function AssessmentSummary() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Assessment result</CardTitle>
        <CardDescription>Max · Labrador · today, 9:42pm</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="destructive">High risk</Badge>
        <span className="text-muted-foreground">See a vet now</span>
      </CardContent>
    </Card>
  );
}
