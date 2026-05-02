import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  createReview,
  deleteReview,
  getMyBookings,
  getMyReviews,
  updateReview,
} from "../services/apiClient";
import { colors, layout } from "../styles/theme";

const RATINGS = [1, 2, 3, 4, 5];

const INITIAL_FORM = {
  booking: "",
  reviewee: "",
  rating: 5,
  reviewText: "",
};

export default function ReviewsScreen() {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState(INITIAL_FORM);

  const reviewerType = user?.role === "worker" ? "worker" : "customer";
  const bookingsRole = reviewerType === "worker" ? "worker" : "customer";

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [reviewsData, bookingsData] = await Promise.all([
        getMyReviews(token),
        getMyBookings(token, bookingsRole),
      ]);
      setReviews(reviewsData);
      setBookings(bookingsData);
    } catch (e) {
      setError(e.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [token, bookingsRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bookingToReviewee = useMemo(() => {
    const map = new Map();
    for (const booking of bookings) {
      const id = reviewerType === "worker"
        ? booking.customer?._id || booking.customer
        : booking.worker?._id || booking.worker;
      if (id) {
        map.set(booking._id, id);
      }
    }
    return map;
  }, [bookings, reviewerType]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId("");
  }

  function useBooking(bookingId) {
    updateForm("booking", bookingId);
    const reviewee = bookingToReviewee.get(bookingId) || "";
    if (reviewee) {
      updateForm("reviewee", reviewee);
    }
  }

  function startEdit(review) {
    setEditingId(review._id);
    setActionError("");
    setForm({
      booking: review.booking?._id || review.booking || "",
      reviewee: review.reviewee?._id || review.reviewee || "",
      rating: review.overallRating || review.rating || 5,
      reviewText: review.reviewText || review.comment || "",
    });
  }

  async function submitReview() {
    try {
      setActionError("");
      setSubmitting(true);

      if (editingId) {
        if (!form.reviewText) {
          setActionError("Review text is required for update");
          return;
        }
        await updateReview(token, editingId, {
          rating: form.rating,
          reviewText: form.reviewText,
        });
      } else {
        if (!form.booking || !form.reviewee || !form.reviewText) {
          setActionError("Booking, reviewee and review text are required");
          return;
        }

        await createReview(token, {
          booking: form.booking,
          reviewee: form.reviewee,
          rating: form.rating,
          reviewText: form.reviewText,
          reviewerType,
        });
      }

      resetForm();
      await loadData();
    } catch (e) {
      setActionError(e.message || (editingId ? "Failed to update review" : "Failed to submit review"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId) {
    try {
      setActionError("");
      await deleteReview(token, reviewId);
      if (editingId === reviewId) {
        resetForm();
      }
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to delete review");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScrollView style={styles.headerWrap}>
            <View style={styles.topRow}>
              <Text style={styles.title}>Reviews</Text>
              <Pressable style={styles.refreshBtn} onPress={loadData}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{editingId ? "Edit Review" : "Create Review"}</Text>

              <Text style={styles.label}>Booking ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Booking ID"
                value={form.booking}
                editable={!editingId}
                onChangeText={(value) => updateForm("booking", value)}
              />
              {!editingId ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                  {bookings.slice(0, 12).map((booking) => (
                    <Pressable
                      key={booking._id}
                      style={[styles.pill, form.booking === booking._id && styles.pillActive]}
                      onPress={() => useBooking(booking._id)}
                    >
                      <Text style={[styles.pillText, form.booking === booking._id && styles.pillTextActive]}>
                        {booking.job?.jobTitle || booking._id.slice(-6)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}

              <Text style={styles.label}>Reviewee ID</Text>
              <TextInput
                style={styles.input}
                placeholder="User ID being reviewed"
                value={form.reviewee}
                editable={!editingId}
                onChangeText={(value) => updateForm("reviewee", value)}
              />

              <Text style={styles.label}>Rating</Text>
              <View style={styles.optionWrap}>
                {RATINGS.map((rating) => (
                  <Pressable
                    key={rating}
                    style={[styles.option, form.rating === rating && styles.optionActive]}
                    onPress={() => updateForm("rating", rating)}
                  >
                    <Text style={[styles.optionText, form.rating === rating && styles.optionTextActive]}>{rating}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Review Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your review"
                multiline
                value={form.reviewText}
                onChangeText={(value) => updateForm("reviewText", value)}
              />

              <Text style={styles.helper}>Reviewer type: {reviewerType}</Text>

              <Pressable style={styles.primaryBtn} onPress={submitReview} disabled={submitting}>
                <Text style={styles.primaryBtnText}>{submitting ? (editingId ? "Updating..." : "Submitting...") : (editingId ? "Update Review" : "Submit Review")}</Text>
              </Pressable>

              {editingId ? (
                <Pressable style={styles.cancelBtn} onPress={resetForm}>
                  <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                </Pressable>
              ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            {loading ? <Text style={styles.helper}>Loading reviews...</Text> : null}
          </ScrollView>
        }
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No reviews found.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>Rating: {item.overallRating || item.rating || "-"}/5</Text>
            <Text style={styles.meta}>Reviewer Type: {item.reviewerType || "-"}</Text>
            <Text style={styles.meta}>Reviewee: {item.reviewee?.firstName ? `${item.reviewee.firstName} ${item.reviewee.lastName || ""}` : item.reviewee || "-"}</Text>
            <Text style={styles.meta}>Booking: {item.booking?.scheduledDate ? new Date(item.booking.scheduledDate).toLocaleDateString() : item.booking || "-"}</Text>
            <Text style={styles.meta} numberOfLines={3}>{item.reviewText || item.comment || "-"}</Text>

            <View style={styles.actionRow}>
              <Pressable style={styles.smallBtn} onPress={() => startEdit(item)}>
                <Text style={styles.smallBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
                <Text style={styles.smallBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWrap: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  refreshBtn: {
    marginLeft: "auto",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: colors.text,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pillRow: {
    marginTop: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.text,
    fontSize: 12,
  },
  pillTextActive: {
    color: colors.primary,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  option: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  optionText: {
    color: colors.text,
    fontWeight: "700",
  },
  optionTextActive: {
    color: colors.primary,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colors.primary,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 8,
    borderRadius: 10,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  cancelBtnText: {
    color: colors.text,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  smallBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#6b1d1d",
  },
  smallBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  helper: {
    color: colors.textMuted,
    marginBottom: 10,
  },
  error: {
    color: colors.danger,
    marginBottom: 10,
  },
});
