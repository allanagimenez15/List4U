using List4U.API.Models;
using Microsoft.EntityFrameworkCore;

namespace List4U.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<List> Lists { get; set; }

    public DbSet<Item> Items { get; set; }

    public DbSet<SharedList> SharedLists { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasMany(e => e.Lists)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId);
        });

        // Lists
        modelBuilder.Entity<List>(entity =>
        {
            entity.ToTable("lists");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.HasMany(e => e.Items)
                .WithOne(e => e.List)
                .HasForeignKey(e => e.ListId);
        });

        // Items
        modelBuilder.Entity<Item>(entity =>
        {
            entity.ToTable("items");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(e => e.Price)
                .HasColumnName("price")
                .HasPrecision(10, 2);

            entity.Property(e => e.IsCompleted)
                .HasColumnName("is_completed");

            entity.Property(e => e.ListId)
                .HasColumnName("list_id");
        });


        modelBuilder.Entity<SharedList>(entity =>
        {
            entity.ToTable("shared_lists");

            entity.HasKey(sharedList => sharedList.Id);

            entity.Property(sharedList => sharedList.Id)
                .HasColumnName("id");

            entity.Property(sharedList => sharedList.ListId)
                .HasColumnName("list_id");

            entity.Property(sharedList => sharedList.UserId)
                .HasColumnName("user_id");

            entity.Property(sharedList => sharedList.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(sharedList => sharedList.List)
                .WithMany()
                .HasForeignKey(sharedList => sharedList.ListId);

            entity.HasOne(sharedList => sharedList.User)
                .WithMany()
                .HasForeignKey(sharedList => sharedList.UserId);
        });
    }
}
