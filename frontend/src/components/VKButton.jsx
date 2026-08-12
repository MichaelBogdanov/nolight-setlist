import { Icon24LogoVk } from "@vkontakte/icons";
import "./VKButton.css";

export default function VKButton() {
    return (
        <a
            href="https://vk.com/no_light_band"
            target="_blank"
            rel="noopener noreferrer"
            className="vk-logo-button"
            aria-label="NoLight ВКонтакте"
            title="NoLight ВКонтакте"
        >
            <span className="vk-logo-icon">
                <Icon24LogoVk width={24} height={24} />
            </span>
        </a>
    );
}