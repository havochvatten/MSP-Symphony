package se.havochvatten.symphony.calculation.batch;

import org.apache.mina.util.ConcurrentHashSet;

import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import java.util.Set;

@ServerEndpoint("/batch-status/{batchId}")
public class BatchStatusEndpoint {

    private Session session;
    private static final Set<BatchStatusEndpoint> listeners = new ConcurrentHashSet<>();
    private String lastStatus;

    @OnMessage
    public void onMessage(Session session, String message) {
        lastStatus = message;
        notify(message, this);
    }

    @OnClose
    public void onClose() {
        listeners.remove(this);
    }

    @OnOpen
    public void onOpen(Session session, EndpointConfig endpointConfig) {
        this.session = session;
        listeners.add(this);
        if(lastStatus != null) {
            sendTo(lastStatus, session.getBasicRemote());
        }
    }

    private static void notify(String message, BatchStatusEndpoint sender) {
        for (BatchStatusEndpoint listener : listeners) {
            synchronized (listener) {
                if (listener == sender) return;
                sendTo(message, listener.session.getBasicRemote());
            }
        }
    }

    private static void sendTo(String message, RemoteEndpoint.Basic recipient) {
        try {
            recipient.sendText(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
