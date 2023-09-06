import { SwitchTheme } from "~~/components/SwitchTheme";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-end items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="text-center">
              <a
                href="https://github.com/scaffold-eth/se-2"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Fork me
              </a>
            </div>
            <span>·</span>
            <div>
              <p className="m-0 text-center">
                Built at 🏰{" "}
                <a
                  href="https://buidlguidl.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  BuidlGuidl
                </a>
              </p>
            </div>
            <span>·</span>
            <div className="text-center">
              <a href="raunaque.eth" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Contact Us
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
