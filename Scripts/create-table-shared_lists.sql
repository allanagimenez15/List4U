use list4u;

CREATE TABLE shared_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shared_lists_lists
        FOREIGN KEY (list_id)
        REFERENCES lists(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shared_lists_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_shared_lists
        UNIQUE (list_id, user_id)
) ENGINE=InnoDB;
