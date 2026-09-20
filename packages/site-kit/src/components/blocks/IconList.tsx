import { Icon } from "../Icon";
import type { IconName } from "../../lib/iconSprite";

export type IconListItem = {
  label: string;
  description?: string;
};

/**
 * The theme's "iconlist" ACF block: a vertical list of check-icon items with
 * bold label + description (used for "The Carolina Heating Promise", etc.).
 */
export function IconList({
  items,
  icon = "check",
  iconClass = "has-check-green-color",
  orientation = "vertical",
  iconSize = "md",
}: {
  items: IconListItem[];
  icon?: IconName;
  iconClass?: string;
  orientation?: "vertical" | "horizontal";
  iconSize?: "md" | "lg";
}) {
  return (
    <div className="iconlist" data-orientation={orientation} data-iconsize={iconSize}>
      <ul role="list">
        {items.map((item) => (
          <li className="iconlist-item" key={item.label}>
            <Icon name={icon} className={`iconlist-icon ${iconClass}`} />
            <div className="iconlist-text">
              <p className="iconlist-label">{item.label}</p>
              {item.description && (
                <div className="iconlist-description">
                  <p>{item.description}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
