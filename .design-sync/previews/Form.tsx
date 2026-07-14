import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useForm,
} from "pitsypet";

export function PetProfileForm() {
  const form = useForm({
    defaultValues: { name: "Bella", weight: "8.2" },
  });

  return (
    <Form {...form}>
      <form className="grid w-72 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bella" {...field} />
              </FormControl>
              <FormDescription>Shown across the app and on vet exports.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input inputMode="decimal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save pet</Button>
      </form>
    </Form>
  );
}
