$(function() {
  var modals = $('.fullExcerptModal');
  modals.show();
  modals.position({
    my: "center center",
    at: "center center",
    of: $(window)
  });
  modals.hide();
  $('.seeFull').click(function() {
    var postId = $(this).data('post-id');
    var postModal = $('.fullExcerptModal[data-post-id='+postId+']');
    postModal.show();
  });
  $('.excerptClose').click(function() {
    var postId = $(this).data('post-id');
    var postModal = $('.fullExcerptModal[data-post-id='+postId+']');
    postModal.hide();
  });
});
