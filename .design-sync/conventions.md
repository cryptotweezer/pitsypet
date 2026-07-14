# PitsyPet UI — conventions

React + Tailwind v4 component kit (shadcn "base-nova" on Base UI). Every component is exported from `window.PitsyPetUI` and imported as `import { Button } from "pitsypet"`.

## Setup

- **Styling ships via `styles.css`** — it `@import`s the compiled Tailwind utilities and `_ds_bundle.css`, plus the token definitions. Nothing renders styled without it. No React provider is required for any component **except** toasts.
- **Tokens are CSS variables** on `:root` (and `.dark` for dark mode). Toggle dark mode by adding `class="dark"` to a wrapping element — there is no theme provider.
- **Toasts**: render `<Toaster />` once near the app root, then call the imperative `toast()` API from `sonner`. `<Toaster />` alone renders nothing (it's the portal host).

## Styling idiom — Tailwind utilities with semantic tokens

Style layout/spacing with normal Tailwind classes. For color, size, and radius use the **semantic token utilities** (never hard-coded hex) so light/dark and theming stay correct:

| Purpose | Classes |
|---|---|
| Surfaces | `bg-background`, `bg-card`, `bg-popover`, `bg-muted` |
| Text | `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-primary` |
| Accent/action | `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`, `bg-accent` |
| Danger | `text-destructive`, `bg-destructive/10` |
| Borders / rings | `border-input`, `border-border`, `ring-foreground/10`, `focus-visible:ring-ring/50` |
| Radius | `rounded-lg`, `rounded-xl` (matches the kit's own corners) |

Compose spacing with `gap-*`, `p-*`, `grid`/`flex` as usual. Read `styles.css` and its imports for the full token/utility vocabulary before inventing classes.

## Variants live as props, not classes

Don't re-style a component by hand — use its variant props:
- `<Button variant="default|outline|secondary|ghost|destructive|link" size="xs|sm|default|lg|icon|icon-sm|icon-lg">`
- `<Badge variant="default|secondary|destructive|outline|ghost">`
- `<Card size="default|sm">`, `<Avatar size="sm|default|lg">`, `<Select>` + `<SelectTrigger size="sm|default">`

Compounds are composed from their parts (all exported): `Card` + `CardHeader`/`CardTitle`/`CardDescription`/`CardAction`/`CardContent`/`CardFooter`; `Dialog` + `DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`/`DialogClose`; `Select` + `SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`; `Sheet` + `SheetContent`/`SheetHeader`/`SheetTitle`/`SheetFooter`. Forms use `Form` (react-hook-form provider) + `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`. Read each component's `.prompt.md` for its API.

## Build snippet

```tsx
import {
  Card, CardHeader, CardTitle, CardDescription, CardAction,
  CardContent, CardFooter, Badge, Button,
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
        <Button variant="ghost" size="sm">History</Button>
        <Button size="sm">New assessment</Button>
      </CardFooter>
    </Card>
  );
}
```
