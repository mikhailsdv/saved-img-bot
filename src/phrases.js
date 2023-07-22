const {trimMessage} = require("./utils")
const env = require("./env")

module.exports = {
	tags_updated_single: "✅ *Теги этого файла были обновлены.*",
	tags_updated_plural: "✅ *Теги этих файлов были обновлены.*",

	saved_single_own_caption: trimMessage(`
		✅ *Файл сохранен с указанными вами тегами.*

		Теперь он будет появляться в поиске в инлайн режиме.
	`),
	saved_plural_own_caption: trimMessage(`
		✅ *Файлы сохранены с указанными вам тегами.*

		Теперь они будут появляться в поиске в инлайн режиме.
	`),
	saved_single_no_caption: trimMessage(`
		✅ *Файл сохранен, но пока что без тегов.*

		Чтобы добавить теги, ответьте на сообщение с файлом, указав теги в своем ответе. Кстати, вы можете присылать файл сразу с тегами.
	`),
	saved_plural_no_caption: trimMessage(`
		✅ *Файлы сохранены, но пока что без тегов.*

		Чтобы добавить теги, ответьте на сообщение с файлами, указав теги в своем ответе. Кстати, вы можете присылать файлы сразу с тегами.
	`),

	deleted_single: trimMessage(`
		❌ *Файл удален.*

		Он больше не будет появляться в поиске в инлайн режиме.
	`),
	deleted_plural: trimMessage(`
		❌ *Файлы удалены.*

		Они больше не будет появляться в поиске в инлайн режиме.
	`),

	recovered_single: trimMessage(`
		✅ *Файл восстановлен.*

		Теперь он снова будет появляться в поиске в инлайн режиме.
	`),
	recovered_plural: trimMessage(`
		✅ *Файлы восстановлены.*

		Теперь они снова будут появляться в поиске в инлайн режиме.
	`),

	button_delete_single: "Удалить файл",
	button_delete_plural: "Удалить файлы",
	button_recover_single: "Восстановить файл",
	button_recover_plural: "Восстановить файлы",

	error_edit_file_not_found:
		"❌ Ошибка при редактировании тегов. Файл не найден.",
	error_edit_tags_not_specified:
		"❌ Ошибка при редактировании тегов. Теги не указаны.",
	error_message_without_context:
		"❌ Если вы хотите добавить или отредактировать теги, то отвечать нужно на само сообщение с файлом.",
	error_no_file: "❌ В этом сообщении нет файлов.",

	share_via_inline: "Поделиться через инлайн",
	try_inline: "Попробовать инлайн поиск",
	you_have_no_pictures: "У вас нет ни одного сохраненного файла",
	nothing_found: "Ничего не найдено",

	start: trimMessage(`
		👋 Привет. Я помогу быстро находить любимые *картинки, видео, гифки, стикеры, документы, аудио, кружочки и голосовые* — будем называть их «файлы». Вот, как это работает:

		🖼 Вы кидаете мне «файл» с его коротким описанием или тегами через запятую, например, \`«красивый закат»\` или \`«мем, кот, грустный»\`, после чего вы можете в инлайн режиме быстро находить нужные файлы просто введя их описание или теги. Чтобы активировать инлайн режим, введите в любом чате @${env.BOT_USERNAME} и пробел.

		🔍 Кстати, поиск довольно гибкий и регистронезависимый, поэтому даже введя в инлайне просто \`«зака»\` вы уже получите ту самую картинку с \`«красивым ЗАКАтом»\`.

		↪️ Вы также можете пересылать мне файлы с других чатов или каналов. Описание этих файлов можно указать вместе с пересылаемым сообщением.

		😎 Ок, давайте начнем. Пришлите мне какую-нибудь картинку с описанием или перешлите с другого чата...

		Все команды: /commands
		Премиум: /premium
		Мой канал: @FilteredInternet
		Для связи: @mikhailsdv
	`),
	hints: trimMessage(`
		💡 Вы можете отправлять картинку через инлайн сразу со своей подписью. Для этого поставьте две точки в конце запроса и начните вводить свою подпись. Например, запрос \`«плачущий кот..это мой муд сейчас»\` после выбора пикчи отправит ее сразу с подписью \`«это мой муд сейчас»\`.

		💡 Вы можете присылать мне сразу несколько картинок альбомом. Описание применится сразу ко всем картинкам в альбоме. Если отредактировать описание, то оно также применится ко всему альбому.

		💡 Чтобы показать в инлайн режиме только конкретный тип файлов, начните запрос с \`photo\`, \`gif\`, \`video\`, \`video_note\`, \`audio\`, \`voice\`, \`document\` или \`sticker\`.

		💡 Вы можете редактировать теги, ответив на сообщение с файлом или напрямую отредактировав текст файла или альбома.

		💡 Бот хорошо понимает форварды. Можете смело пересылать боту посты с картинками, гифки или альбомы. Их теги можно указать в самом сообщении к форварду или отредактировать позже.

		💡 Поддерживая бота на любую сумму от 49₽ вы получаете доступ к Premium-функциям. Подробнее /premium.
	`),
	statistics: trimMessage(`
		📈 *Вот ваша статистика:*

		🖼 Всего сохранено файлов: count;
		📸 Фотографий: photos;
		📹 Видео: videos;
		⚪️ Кружочков: video_notes;
		🔁 Гифок: gifs;
		😜 Стикеров: stickers;
		📄 Документов: documents;
		🎙️ Голосовых: voices;
		🎵 Аудио: audios;
		🏷️ Количество файлов с тегами: has_tags.
	`),
	statistics_unavailable: trimMessage(`
		📈 *Вот ваша статистика:*

		🖼 Всего сохранено файлов: 🔐
		📸 Фотографий: 🔐
		📹 Видео: 🔐
		⚪️ Кружочков: 🔐
		🔁 Гифок: 🔐
		😜 Стикеров: 🔐
		📄 Документов: 🔐
		🎙️ Голосовых: 🔐
		🎵 Аудио: 🔐
		🏷️ Количество файлов с тегами: 🔐
		🔝 Самая любимая сохраненка: 🔐
	`),
	most_used_file:
		"🔝 А это ваша самая любимая сохраненка. Вы использовали ее count",
	move_instruction: trimMessage(`
		↪️ Перешлите это сообщение в новый аккаунт и уже в новом аккаунте нажмите на кнопку *«Перенести сюда»*. Все ваши сохраненные файлы будут мгновенно перенесены в новый аккаунт.

		👑 При переносе данных доступ к премиум функциям автоматически перейдет в новый аккаунт.
	`),
	move_here: "⬇️ Перенести сюда",
	move_error:
		"❌ Не удалось перенести файлы. Попробуйте сгенерировать ссылку еще раз, либо свяжитесь с автором бота @mikhailsdv.",
	move_failed:
		"❌ Не удалось перенести файлы. Cвяжитесь с автором бота @mikhailsdv.",
	move_same_account:
		"❌ Нельзя переносить файлы в тот же самый аккаунт. На кнопку должен нажать получатель.",
	move_success:
		"✅ *Файлы успешно перенесены в этот аккаунт. 👑 Ваш Premium статус восстановлен.*",
	drop_confirm: trimMessage(`
		⚠️ *Внимание* ⚠️
		
		Вы собираетесь удалить *все* свои сохраненные файлы. Подтвердите свои намерения.
	`),
	drop_confirm_button: "❌ Да, удалить все мои файлы",
	drop_success: "✅ *Все ваши файлы были удалены.*",
	become_premium: trimMessage(`
		👑 *Станьте Premium, чтобы разблокировать новые функции:*

		📈 Просмотр статистики;
		😜 Поддержка стикеров;
		⚪️ Поддержка видео-кружочков;
		🔁 Перенос базы в другой аккаунт;
		❌ Удаление всех файлов;
		🆕 Получайте новые Premium-функции бесплатно.

		Чтобы стать Premium, поддержите бота на любую сумму от 49₽.

		ЮMoney: \`4100 1173 1994 4149\`
		QIWI: \`+77002622563\`
		Kaspi Bank: \`4400 4302 1955 7599\`
		Jusan Bank: \`5356 5020 0928 6216\`
		BTC: \`1MDRDDBURiPEg93epMiryCdGvhEncyAbpy\`
		Или на сайте: https://babki.mishasaidov.com

		После оплаты напишите мне в личку @mikhailsdv и приложите скриншот оплаты.
	`),
	commands: trimMessage(`
		😎 Начать /start
		💡 Советы /hints
		👑 Стать Premium /premium
		📈 Статистика /statistics
		🔁 Перенос данных /move
		❌ Удалить все файлы /drop
	`),
}
