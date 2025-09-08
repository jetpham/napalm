import Ansi from "./ansi";
import { googleAns } from "../../assets/google-ans";

export default function GoogleAns() {
    console.log(googleAns);
  return (
    <div className="inline-block">
      <Ansi className="select-none">
        {googleAns}
      </Ansi>
    </div>
  );
}
