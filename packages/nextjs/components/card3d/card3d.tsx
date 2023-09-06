import { ReactNode, useEffect } from "react";

export const Card3d = ({ content = <></> }: { content?: ReactNode }) => {
  // const cardRef = useRef(null);
  // const glowRef = useRef(null);

  useEffect(() => {
    const $card = document.querySelector("#card-3d");
    const $glow = document.querySelector("#card-3d-glow");
    let bounds: DOMRect;
    function rotateToMouse(e: { clientX: any; clientY: any }) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2,
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      $card.style.transform = `
        scale3d(1.07, 1.07, 1.07)
        rotate3d(
          ${center.y / 100},
          ${-center.x / 100},
          0,
          ${Math.log(distance) * 3}deg)`;
      // add style shadow box-shadow
      $card.style.boxShadow = `${(-8 * center.x) / 150}px ${(-8 * center.y) / 200}px 16px 4px #00000096`;

      $glow.style.background = `
        radial-gradient(
          circle at
          ${center.x * 1.5 + bounds.width / 2}px
          ${center.y * 1.5 + bounds.height / 2}px,
          #ffffff25,
          #00000011)`;
    }

    $card.addEventListener("mouseenter", () => {
      bounds = $card.getBoundingClientRect();
      document.addEventListener("mousemove", rotateToMouse);
      $card.style.boxShadow = `2px 3px 20px 8px #00000096`;
    });

    $card.addEventListener("mouseleave", () => {
      document.removeEventListener("mousemove", rotateToMouse);
      $card.style.transform = "";
      $card.style.boxShadow = "0px 0px 4px 1px #00000096";
      $glow.style.background = "";
    });
  }, []);

  return (
    <div
      id="card-3d"
      className="p-[1em] w-[300px] h-[400px] rounded-2xl bg-cover relative duration-500 transition-all ease-out shadow shadow-black hover:shadow-2xl"
      style={{
        backgroundImage: "url(./card_bg1.jpg)",
      }}
    >
      {content}
      <div id="card-3d-glow" className="absolute w-full h-full left-0 top-0 rounded-2xl" />
    </div>
  );
};
