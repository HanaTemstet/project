﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DAL
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class Charity_DBEntities : DbContext
    {
        public Charity_DBEntities()
            : base("name=Charity_DBEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<CategoryGMH> CategoryGMH { get; set; }
        public virtual DbSet<DonationOffers> DonationOffers { get; set; }
        public virtual DbSet<Donations> Donations { get; set; }
        public virtual DbSet<GMH> GMH { get; set; }
        public virtual DbSet<Images> Images { get; set; }
        public virtual DbSet<LENDINGS> LENDINGS { get; set; }
        public virtual DbSet<NeedsGmhim> NeedsGmhim { get; set; }
        public virtual DbSet<OPINIONS> OPINIONS { get; set; }
        public virtual DbSet<Products> Products { get; set; }
        public virtual DbSet<PRODUCTtoGMH> PRODUCTtoGMH { get; set; }
        public virtual DbSet<RequestForLoan> RequestForLoan { get; set; }
        public virtual DbSet<Searches> Searches { get; set; }
        public virtual DbSet<USERS> USERS { get; set; }
    }
}
