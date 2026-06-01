package revi1337.todo.common.timing;

public class QueryTimingHolder {

    private static final ThreadLocal<Long> total = ThreadLocal.withInitial(() -> 0L);

    public static void add(long ms) {
        total.set(total.get() + ms);
    }

    public static long get() {
        return total.get();
    }

    public static void reset() {
        total.remove();
    }
}
