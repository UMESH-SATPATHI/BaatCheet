export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        throw new Error("This browser does not support desktop notifications");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("Notification permission denied");
    }

    return true;
}

export function showNotification(message) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted" || !document.hidden) return;

    const senderName = message.sender?.fullName || message.senderName || "New message";
    let body = message.text;

    if (!body) {
        if (message.image) body = "You received an image";
        else if (message.video) body = "You received a video";
        else if (message.fileName || message.fileUrl) body = "You received a file";
        else body = "You have a new message";
    }

    const notification = new Notification(senderName, {
        body,
        icon: message.sender?.profilePic || "/favicon.svg",
        tag: `message-${message.senderId || "new"}`,
        renotify: true,
    });

    notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
    };
}