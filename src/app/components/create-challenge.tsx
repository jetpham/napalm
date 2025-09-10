import { Form } from "radix-ui";
import { api } from "~/trpc/server";

interface CreateChallengeFormProps {
  gameId: string;
  userId: string;
}

export async function CreateChallengeForm({
  gameId,
  userId,
}: CreateChallengeFormProps) {
  // Fetch data server-side to check permissions
  const [game, isGameEnded] = await Promise.all([
    api.game.getById({ id: gameId }),
    api.game.isGameEnded({ gameId }),
  ]);

  const isAdmin = game?.adminId === userId;
  const canCreateChallenge = isAdmin && !isGameEnded;

  if (!canCreateChallenge) {
    return null;
  }

  async function createChallenge(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const flag = formData.get("flag") as string;
    const pointValue = Number(formData.get("pointValue"));

    if (!title || !flag || pointValue <= 0) {
      throw new Error("Title, flag, and valid point value are required");
    }

    await api.challenge.create({
      gameId,
      title,
      description: description || undefined,
      flag,
      pointValue,
    });

    // Redirect to refresh the page and show the new challenge
    // Note: In a real app, you might want to use revalidatePath instead
  }

  return (
    <div>
      <h3>Create New Challenge</h3>
      <Form.Root action={createChallenge}>
        <Form.Field name="title">
          <Form.Label>Challenge Title</Form.Label>
          <Form.Control asChild>
            <input type="text" placeholder="Challenge Title" required />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a challenge title
          </Form.Message>
        </Form.Field>

        <Form.Field name="description">
          <Form.Label>Description (optional)</Form.Label>
          <Form.Control asChild>
            <textarea placeholder="Description (optional)" rows={3} />
          </Form.Control>
        </Form.Field>

        <Form.Field name="flag">
          <Form.Label>Flag</Form.Label>
          <Form.Control asChild>
            <input type="text" placeholder="Flag" required />
          </Form.Control>
          <Form.Message match="valueMissing">Please enter a flag</Form.Message>
        </Form.Field>

        <Form.Field name="pointValue">
          <Form.Label>Point Value</Form.Label>
          <Form.Control asChild>
            <input
              type="number"
              placeholder="Point Value"
              min="1"
              defaultValue="100"
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a point value
          </Form.Message>
          <Form.Message match="rangeUnderflow">
            Point value must be at least 1
          </Form.Message>
        </Form.Field>

        <Form.Submit asChild>
          <button type="submit">Create Challenge</button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}
