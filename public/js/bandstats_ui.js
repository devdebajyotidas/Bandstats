$(document).ready( domSetup );

function domSetup() {
    /**
     * nav tabs for external ids
     */
    $('.tabs nav.external-ids a').live('click', function(e){
        e.preventDefault();
        if ($(this).hasClass('active')) {
            return false;
        } else {
            $('.tabs nav.external-ids a').removeClass('active');
            $(this).addClass('active');
      
            matchRel = $(this).attr('rel');
            $(this).parent().parent().parent().siblings('div').slideUp(function(){
                setTimeout(function(){
                    $('.tabs > div#'+ matchRel).slideDown();
                },300);
            });
        }
    });

    /**************************************
     * image drag and drop
     */
    $('.image-draggable').live('dragstart', function(e) {
        var source = $(this).attr('src');
        e.originalEvent.dataTransfer.setData('src', source);
    });

    $('.image-droppable').bind('dragover', function(e) {
        e.preventDefault();
        return false;
    });

    $('.image-droppable').live('drop', function(e) {
        e.preventDefault();
        var source = e.originalEvent.dataTransfer.getData('src');
        $(this).attr('src', source); 
    });
    
    /*********************************
     * modal window
     */
    $('.modal').live('click', function() {
        openModal();
    });
    
    $('#modal-close').live('click', function() {
        closeModal();
    });

}

function openModal() {
    $('#modal').empty();
    $('#modal').append("<a href='#' id='modal-close'>Close</a>");
    $('#modal').addClass('loading');
    $('#overlay').fadeIn(function() {
        $('#modal').fadeIn();
        return false;
    });
}

function closeModal() {
    $('#modal').fadeOut(function() {
        $('#overlay').fadeOut();
        return false;
    });
}

function alertModal(message) {
    $('#modal').addClass('alert');
    openModal();
    $('#modal').removeClass('loading');
    $('#modal').append('<p>' + message + '</p>');
}
