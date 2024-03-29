
const sender_id = "<%= user._id %>";
const socket = io("/user-namespace", {
    auth: {
        token: "<%= user._id %>"
    }
})
let receiver_id;
$(document).ready(function () {
    $(".user-list").click(function () {
        receiver_id = $(this).attr("data-id");
        $(".start-head").hide();
        $(".chat-section").show();
        socket.emit("existChat", { sender_id, receiver_id });
    });
})

//update user online
socket.on("getOnline", function (data) {
    $(`#` + data.user_id + "-status").text("Online");
    $("#" + data.user_id + "-status").removeClass("offline-status");
    $("#" + data.user_id + "-status").addClass("online-status")
})

//update user offline
socket.on("getOffline", function (data) {
    $("#" + data.user_id + "-status").text("Offline");
    $("#" + data.user_id + "-status").removeClass("online-status");
    $("#" + data.user_id + "-status").addClass("offline-status")
})

//save chat of user
$("#chat-form").submit(function (e) {
    e.preventDefault();
    const message = $("#message").val();

    $.ajax({
        url: "/save-chat",
        type: "POST",
        data: { sender_id: sender_id, receiver_id: receiver_id, message: message },
        dataType: "json",
        success: function (data) {
            if (data.success) {
                $("#message").val("")
                let chat = data.data.message
                let html = `<div class="current-user-chat" id="` + data.data._id + `">
                                <h5><span>`+ chat + `</span>
                                    <i class="fa fa-trash" aria-hidden="true" data-id='` + data.data._id + `' data-toggle="modal" data-target="#deleteChatModel"></i>
                                    <i class="fa fa-edit" aria-hidden="true" data-id='` + data.data._id + `' data-msg='` + chat + `' data-toggle="modal" data-target="#updateChatModel"></i>
                                    </h5>
                            </div>`
                $(".chat-container").append(html)
                socket.emit("newChat", data.data);
                scrollChat()
            } else {
                alert(data.message)
            }
        }

    })
});

socket.on("loadNewChat", function (data) {
    if (sender_id == data.receiver_id && receiver_id == data.sender_id) {
        const html = `
    <div class="distance-user-chat" id="`+ data._id + `">
        <h5>`+ data.message + `</h5>
        
    </div>
    `
        $(".chat-container").append(html);
    }
    scrollChat()
});


//load old chats
socket.on("loadChat", function (data) {
    $(".chat-container").html("");
    const chats = data.chats;
    let html = "";
    let addClass;
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].sender_id == sender_id) {
            addClass = "current-user-chat"
        } else {
            addClass = "distance-user-chat"
        }
        html += `
        <div class='`+ addClass + `' id='` + chats[i]._id + `'>
            <h5><span>`+ chats[i].message + `</span>`;
        if (chats[i].sender_id == sender_id) {

            html += ` <i class="fa fa-trash" aria-hidden="true" data-id='` + chats[i]._id + `' data-toggle="modal" data-target="#deleteChatModel"></i> 
            <i class="fa fa-edit" aria-hidden="true" data-id='` + chats[i]._id + `' data-msg='` + chats[i].message + `' data-toggle="modal" data-target="#updateChatModal"></i>`;
        }
        html += `
            </h5></div>`;


    }
    $(".chat-container").append(html)
    scrollChat()
});

// scroll chat container
function scrollChat() {
    $(".chat-container").animate({
        scrollTop: $(".chat-container").offset().top + $(".chat-container")[0].scrollHeight
    }, 0);
}

// delete chat 
$(document).on("click", ".fa-trash", function () {
    const msg = $(this).parent().text();
    $("#delete-message").text(msg);
    $("#delete-message-id").val($(this).attr("data-id"))
})

$("#deleteChatForm").submit(function (e) {
    e.preventDefault();
    const id = $("#delete-message-id").val();

    $.ajax({
        url: "/delete-chat",
        type: "POST",
        data: { id: id },
        success: function (resp) {
            if (resp.success == true) {
                $("#" + id).remove();
                $("#deleteChatModel").modal("hide");
                socket.emit("chatDeleted", id);
            } else {
                alert(resp.message);
            }
        }
    })

})
socket.on("chatMsgDeleted", function (id) {
    $("#" + id).remove();
})

// update chat user
$(document).on("click", ".fa-edit", function () {
    $("#update-message-id").val($(this).attr("data-id"))
    $("#update-message").val($(this).attr("data-msg"))
})

$("#updateChatForm").submit(function (e) {
    e.preventDefault();
    const id = $("#update-message-id").val();
    const msg = $("#update-message").val();
    $.ajax({
        url: "/update-chat",
        type: "POST",
        data: { id: id, message: msg },
        success: function (resp) {
            if (resp.success == true) {
                $("#updateChatModal").modal("hide");
                $("#" + id).find("span").text(msg);
                $("#" + id).find(".fa-edit").attr("data-msg", msg);
                socket.emit("chatUpdated", { id: id, message: msg });
            } else {
                alert(resp.message)
            }
        }
    })

})

socket.on("chatMsgUpdated", function (data) {
    $("#" + data.id).find("span").text(data.message);

})
