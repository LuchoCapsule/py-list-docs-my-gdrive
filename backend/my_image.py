class my_ImageClass:
    def __init__(self, name, id, alt, binario, webViewLink, selected=False, group=1):
        self.name = name
        self.id = id
        self.alt = alt
        self.binario = binario
        self.webViewLink = webViewLink
        self.selected = selected
        self.group = group

    def to_dict(self):
        return {
            "name": self.name,
            "id": self.id,
            "alt": self.alt,
            "binario": self.binario,
            "webViewLink": self.webViewLink,
            "selected": self.selected,
            "group": self.group
        }