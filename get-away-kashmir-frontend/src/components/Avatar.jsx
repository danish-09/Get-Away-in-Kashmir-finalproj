import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { useMemo } from "react";

const Avatar = ({ username, personality }) => {
  // Combine username and personality into a consistent seed
  const seed = `${username}-${personality}`.toLowerCase().trim();

  // Generate the avatar once when seed changes
  // seed is dependency array when changes useMemo() executes again

  const AvatarSvg = useMemo(() => {
    const avatar = createAvatar(lorelei, {
      seed: seed,
      // you can add style options here
    });
    return avatar.toString();
  }, [seed]);

  return (
    <div className="cursor-pointer w-16 h-16">
      <img
        //  embeds the SVG into the image source. so it can be rendered by the img tag
        src={`data:image/svg+xml;utf8,${encodeURIComponent(AvatarSvg)}`}
        alt={`${username}'s avatar`}
        className="w-full h-full rounded-full"
      />
    </div>
  );
};

export default Avatar;
