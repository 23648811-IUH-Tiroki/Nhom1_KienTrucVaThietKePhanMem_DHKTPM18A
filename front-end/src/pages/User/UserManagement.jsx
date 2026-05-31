// Phần bị conflict trong handleFormSubmit, sửa lại thành:
const handleFormSubmit = async (formData) => {
  try {
    setIsSubmitting(true);
    setFormApiErrors({});
    let response;
    if (selectedUser) {
      response = await updateUserRequest(selectedUser._id, formData);
      toast.success("Cập nhật người dùng thành công");
      if (selectedUser._id === currentUser?._id) await fetchCurrentUser();
    } else {
      response = await createUserRequest(formData);
      toast.success("Thêm mới người dùng thành công");
    }
    setIsModalOpen(false);
    setSelectedUser(null);
    if (searchTerm || statusFilter !== "all" || roleFilter !== "all") {
      await searchUsers();
    } else {
      await fetchUsers();
    }
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    if (err.response?.data?.errors && typeof err.response.data.errors === "object") {
      setFormApiErrors(err.response.data.errors);
    }
    toast.error(err.response?.data?.message || err.message);
  } finally {
    setIsSubmitting(false);
  }
};